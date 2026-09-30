import { useState, useRef, useEffect } from 'react';

export default function useMediaStream() {
    const localVideoref = useRef();

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState();

    const [video, setVideo] = useState([]);
    const [audio, setAudio] = useState();
    const [screen, setScreen] = useState();

    const connectionsRef = useRef({});
    const socketRef = useRef(null);

    // NAYE refs: socket emit ke liye hamesha latest, synchronous value chahiye
    const videoStateRef = useRef();
    const audioStateRef = useRef();

    const silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    const black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(!!videoPermission);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(!!audioPermission);

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            const userMediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30, max: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            if (userMediaStream) {
                window.localStream = userMediaStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = userMediaStream;
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPermissions();
        // eslint-disable-next-line
    }, []);

    const getMedia = async () => {
        if (!window.localStream) {
            await getPermissions();
        }
        videoStateRef.current = videoAvailable;
        audioStateRef.current = audioAvailable;
        setVideo(videoAvailable);
        setAudio(audioAvailable);
    };

    const handleVideo = async () => {
        const newVideoState = !video;
        setVideo(newVideoState);
        videoStateRef.current = newVideoState;

        if (newVideoState === false) {
            if (window.localStream) {
                const videoTracks = window.localStream.getVideoTracks();
                videoTracks.forEach(track => track.stop());

                let blackTrack = black();
                const audioTracks = window.localStream.getAudioTracks();
                const newStream = new MediaStream([blackTrack, ...audioTracks]);

                window.localStream = newStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = newStream;
                }

                for (let id in connectionsRef.current) {
                    const sender = connectionsRef.current[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(blackTrack);
                }
            }
        } else {
            try {
                const camStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 30, max: 30 }
                    }
                });
                const newVideoTrack = camStream.getVideoTracks()[0];

                const audioTracks = window.localStream ? window.localStream.getAudioTracks() : [];
                const newStream = new MediaStream([newVideoTrack, ...audioTracks]);

                window.localStream = newStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = newStream;
                }

                for (let id in connectionsRef.current) {
                    const sender = connectionsRef.current[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(newVideoTrack);
                }
            } catch (e) {
                console.log(e);
            }
        }

        if (socketRef.current) {
            socketRef.current.emit('video-status', newVideoState);
        }
    };

    const handleAudio = () => {
        const newAudioState = !audio;
        setAudio(newAudioState);
        audioStateRef.current = newAudioState;

        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = newAudioState;
            });
        }
        if (socketRef.current) {
            socketRef.current.emit('audio-status', newAudioState);
        }
    };

    const getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connectionsRef.current) {
            connectionsRef.current[id].addStream(window.localStream);
            connectionsRef.current[id].createOffer().then((description) => {
                connectionsRef.current[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connectionsRef.current[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            videoStateRef.current = false;
            audioStateRef.current = false;

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connectionsRef.current) {
                connectionsRef.current[id].addStream(window.localStream);
                connectionsRef.current[id].createOffer().then((description) => {
                    connectionsRef.current[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connectionsRef.current[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        });
    };

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }
        }
    };

    const getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e); }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connectionsRef.current) {
            connectionsRef.current[id].addStream(window.localStream);
            connectionsRef.current[id].createOffer().then((description) => {
                connectionsRef.current[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connectionsRef.current[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            getUserMedia();
        });
    };

    const getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e));
            }
        }
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
        // eslint-disable-next-line
    }, [screen]);

    const handleScreen = () => {
        setScreen(!screen);
    };

    return {
        localVideoref,
        videoAvailable,
        audioAvailable,
        screenAvailable,
        video,
        audio,
        screen,
        connectionsRef,
        socketRef,
        videoStateRef,
        audioStateRef,
        getMedia,
        handleVideo,
        handleAudio,
        handleScreen,
    };
}