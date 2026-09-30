import { useState, useEffect } from 'react';
import server from '../environment';

export default function usePeerConnections({ connectionsRef, socketRef, socketIdRef, videoRef, setVideos, videoStatusRef, audioStatusRef, usernamesRef }) {

    
    const [iceServers, setIceServers] = useState([
        { urls: "stun:stun.l.google.com:19302" }
    ]);

    useEffect(() => {
        const fetchTurnCredentials = async () => {
            try {
                const response = await fetch(`${server}/api/v1/users/get_turn_credentials`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await response.json();
                setIceServers(data);
            } catch (e) {
                console.log("Failed to fetch TURN credentials, using STUN only:", e);
            }
        };

        fetchTurnCredentials();
    }, []);

    // Video sender ka bitrate floor/ceiling set karta hai, taaki quality bahut zyada na gire aur bandwidth bhi waste na ho
    const setVideoBitrate = (peerConnection) => {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            const params = sender.getParameters();
            if (!params.encodings) {
                params.encodings = [{}];
            }
            params.encodings[0].minBitrate = 300000;
            params.encodings[0].maxBitrate = 2500000;
            sender.setParameters(params).catch(e => console.log("Bitrate set failed:", e));
        }
    };

    const createPeerConnection = (socketListId) => {
        connectionsRef.current[socketListId] = new RTCPeerConnection({ iceServers });

        connectionsRef.current[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
        };

        connectionsRef.current[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
                setVideos(videos => {
                    const updatedVideos = videos.map(video =>
                        video.socketId === socketListId ? { ...video, stream: event.stream } : video
                    );
                    videoRef.current = updatedVideos;
                    return updatedVideos;
                });
            } else {
                const knownVideoStatus = videoStatusRef.current[socketListId];
                const initialVideoOff = knownVideoStatus === undefined ? false : !knownVideoStatus;

                const knownAudioStatus = audioStatusRef.current[socketListId];
                const initialAudioOff = knownAudioStatus === undefined ? false : !knownAudioStatus;

                let newVideo = {
                    socketId: socketListId,
                    stream: event.stream,
                    autoplay: true,
                    playsinline: true,
                    videoOff: initialVideoOff,
                    audioOff: initialAudioOff,
                    username: usernamesRef.current[socketListId] || null,
                    handRaised: false
                };

                setVideos(videos => {
                    const updatedVideos = [...videos, newVideo];
                    videoRef.current = updatedVideos;
                    return updatedVideos;
                });
            }
        };

        if (window.localStream !== undefined && window.localStream !== null) {
            connectionsRef.current[socketListId].addStream(window.localStream);
            setTimeout(() => setVideoBitrate(connectionsRef.current[socketListId]), 1000);
        } else {
            console.log("No local stream available yet for", socketListId);
        }
    };

    const gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connectionsRef.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connectionsRef.current[fromId].createAnswer().then((description) => {
                            connectionsRef.current[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connectionsRef.current[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }

            if (signal.ice) {
                connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

    const handleUserJoined = (id, clients) => {
        clients.forEach((socketListId) => {
            createPeerConnection(socketListId);
        });

        if (id === socketIdRef.current) {
            for (let id2 in connectionsRef.current) {
                if (id2 === socketIdRef.current) continue;

                try {
                    connectionsRef.current[id2].addStream(window.localStream);
                    setTimeout(() => setVideoBitrate(connectionsRef.current[id2]), 1000);
                } catch (e) { }

                connectionsRef.current[id2].createOffer().then((description) => {
                    connectionsRef.current[id2].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connectionsRef.current[id2].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        }
    };

    const removeConnection = (id) => {
        if (connectionsRef.current[id]) {
            connectionsRef.current[id].close();
            delete connectionsRef.current[id];
        }
    };

    return {
        gotMessageFromServer,
        handleUserJoined,
        removeConnection
    };
}