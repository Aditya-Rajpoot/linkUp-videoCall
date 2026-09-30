import { useRef, useState } from 'react';
import io from "socket.io-client";
import server from '../environment';
import usePeerConnections from './usePeerConnections';

const server_url = server;

export default function useSocket({ mediaStream, username }) {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const videoRef = useRef([]);

    const [videos, setVideos] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [otherUserLeft, setOtherUserLeft] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [floatingReactions, setFloatingReactions] = useState([]);

    const [waitingForApproval, setWaitingForApproval] = useState(false);
    const [joinRejected, setJoinRejected] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);

    const videoStatusRef = useRef({});
    const audioStatusRef = useRef({});
    const usernamesRef = useRef({});

    const { connectionsRef } = mediaStream;

    const {
        gotMessageFromServer,
        handleUserJoined,
        removeConnection
    } = usePeerConnections({
        connectionsRef,
        socketRef,
        socketIdRef,
        videoRef,
        setVideos,
        videoStatusRef,
        audioStatusRef,
        usernamesRef
    });

    const addMessage = (data, sender, socketIdSender) => {
        setMessages(prevMessages => [
            ...prevMessages,
            {
                sender: sender,
                data: data
            }
        ]);

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages(prevNewMessages =>
                prevNewMessages + 1
            );
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(
            server_url,
            {
                secure: false
            }
        );

        mediaStream.socketRef.current =
            socketRef.current;

        socketRef.current.on(
            'signal',
            gotMessageFromServer
        );

        socketRef.current.on('connect', () => {
            socketIdRef.current =
                socketRef.current.id;

            socketRef.current.on(
                'waiting-for-approval',
                () => {
                    setWaitingForApproval(true);
                }
            );

            socketRef.current.on(
                'join-approved',
                () => {
                    setWaitingForApproval(false);
                    setJoinRejected(false);
                }
            );

            socketRef.current.on(
                'join-rejected',
                () => {
                    setJoinRejected(true);
                    setWaitingForApproval(false);
                }
            );

            socketRef.current.on(
                'you-are-host',
                () => {
                    setIsHost(true);
                }
            );

            socketRef.current.on(
                'join-request',
                (
                    requesterId,
                    requesterUsername
                ) => {
                    setPendingRequests(prev => [
                        ...prev,
                        {
                            socketId: requesterId,
                            username: requesterUsername
                        }
                    ]);
                }
            );

            socketRef.current.on(
                'chat-message',
                addMessage
            );

            socketRef.current.on(
                'user-left',
                id => {
                    setVideos(videos => {
                        const updatedVideos =
                            videos.filter(
                                video =>
                                    video.socketId !== id
                            );

                        if (
                            updatedVideos.length === 0
                        ) {
                            setOtherUserLeft(true);
                        }

                        return updatedVideos;
                    });

                    delete videoStatusRef.current[id];
                    delete audioStatusRef.current[id];
                    delete usernamesRef.current[id];

                    removeConnection(id);

                    setPendingRequests(prev =>
                        prev.filter(
                            request =>
                                request.socketId !== id
                        )
                    );
                }
            );

            socketRef.current.on(
                'video-status-update',
                (
                    fromId,
                    videoStatus
                ) => {
                    videoStatusRef.current[fromId] =
                        videoStatus;

                    setVideos(videos =>
                        videos.map(video =>
                            video.socketId === fromId
                                ? {
                                    ...video,
                                    videoOff:
                                        !videoStatus
                                }
                                : video
                        )
                    );
                }
            );

            socketRef.current.on(
                'audio-status-update',
                (
                    fromId,
                    audioStatus
                ) => {
                    audioStatusRef.current[fromId] =
                        audioStatus;

                    setVideos(videos =>
                        videos.map(video =>
                            video.socketId === fromId
                                ? {
                                    ...video,
                                    audioOff:
                                        !audioStatus
                                }
                                : video
                        )
                    );
                }
            );

            socketRef.current.on(
                'user-name-update',
                (
                    fromId,
                    name
                ) => {
                    usernamesRef.current[fromId] =
                        name;

                    setVideos(videos =>
                        videos.map(video =>
                            video.socketId === fromId
                                ? {
                                    ...video,
                                    username: name
                                }
                                : video
                        )
                    );
                }
            );

            socketRef.current.on(
                'raise-hand-update',
                (
                    fromId,
                    status
                ) => {
                    setVideos(videos =>
                        videos.map(video =>
                            video.socketId === fromId
                                ? {
                                    ...video,
                                    handRaised: status
                                }
                                : video
                        )
                    );
                }
            );

            socketRef.current.on(
                'reaction-update',
                (
                    fromId,
                    emoji
                ) => {
                    const reactionId =
                        Date.now() +
                        Math.random();

                    setFloatingReactions(prev => [
                        ...prev,
                        {
                            id: reactionId,
                            socketId: fromId,
                            emoji: emoji
                        }
                    ]);

                    setTimeout(() => {
                        setFloatingReactions(prev =>
                            prev.filter(
                                reaction =>
                                    reaction.id !==
                                    reactionId
                            )
                        );
                    }, 3000);
                }
            );

            socketRef.current.on(
                'user-joined',
                (
                    id,
                    clients
                ) => {
                    handleUserJoined(
                        id,
                        clients
                    );

                    setTimeout(() => {
                        if (socketRef.current) {
                            socketRef.current.emit(
                                'video-status',
                                mediaStream
                                    .videoStateRef
                                    .current
                            );

                            socketRef.current.emit(
                                'audio-status',
                                mediaStream
                                    .audioStateRef
                                    .current
                            );

                            socketRef.current.emit(
                                'username',
                                username,
                                window.location.href
                            );
                        }
                    }, 1000);
                }
            );

            socketRef.current.emit(
                'join-call',
                window.location.href,
                username
            );
        });
    };

    const sendMessage = () => {
        socketRef.current.emit(
            'chat-message',
            message,
            username
        );

        setMessage("");
    };

    const handleRaiseHand = () => {
        const newState = !handRaised;

        setHandRaised(newState);

        if (socketRef.current) {
            socketRef.current.emit(
                'raise-hand',
                newState
            );
        }
    };

    const sendReaction = emoji => {
        if (socketRef.current) {
            socketRef.current.emit(
                'reaction',
                emoji
            );
        }

        const reactionId =
            Date.now() +
            Math.random();

        setFloatingReactions(prev => [
            ...prev,
            {
                id: reactionId,
                socketId: socketIdRef.current,
                emoji: emoji
            }
        ]);

        setTimeout(() => {
            setFloatingReactions(prev =>
                prev.filter(
                    reaction =>
                        reaction.id !==
                        reactionId
                )
            );
        }, 3000);
    };

    const respondToJoinRequest = (
        requesterId,
        approved
    ) => {
        if (socketRef.current) {
            socketRef.current.emit(
                'join-response',
                requesterId,
                approved,
                window.location.href
            );
        }

        setPendingRequests(prev =>
            prev.filter(
                request =>
                    request.socketId !==
                    requesterId
            )
        );
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    return {
        socketRef,
        socketIdRef,
        videos,
        messages,
        message,
        setMessage,
        newMessages,
        setNewMessages,
        otherUserLeft,
        handRaised,
        floatingReactions,
        waitingForApproval,
        joinRejected,
        isHost,
        pendingRequests,
        connectToSocketServer,
        sendMessage,
        handleRaiseHand,
        sendReaction,
        respondToJoinRequest,
        disconnect
    };
}