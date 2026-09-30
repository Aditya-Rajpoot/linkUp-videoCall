import React, { useState } from 'react';
import { Typography, Button } from '@mui/material';

import useMediaStream from '../hooks/useMediaStream';
import useSocket from '../hooks/useSocket';

import UsernamePrompt from '../components/lobby/UsernamePrompt';
import WaitingScreen from '../components/lobby/WaitingScreen';

import VideoGrid from '../components/video/VideoGrid';
import ControlBar from '../components/video/ControlBar';

import ChatPanel from '../components/chat/ChatPanel';
import JoinRequestsPanel from '../components/video/JoinRequestsPanel';

import styles from '../styles/videoComponent.module.css';

export default function VideoMeetComponent() {
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [showModal, setModal] = useState(true);
    const [pinnedId, setPinnedId] = useState(null);
    const [hasConnected, setHasConnected] = useState(false);

    const mediaStream = useMediaStream();

    const socket = useSocket({
        mediaStream,
        username
    });

    const connect = async () => {
        setAskForUsername(false);

        await mediaStream.getMedia();

        socket.connectToSocketServer();

        setHasConnected(true);
    };

    const handleEndCall = () => {
        try {
            const tracks =
                mediaStream.localVideoref.current
                    .srcObject
                    .getTracks();

            tracks.forEach(track => track.stop());
        } catch (e) {
            console.log("Error stopping media:", e);
        }

        socket.disconnect();

        window.location.href = "/";
    };

    const toggleChat = () => {
        setModal(prev => {
            const newState = !prev;

            if (newState) {
                socket.setNewMessages(0);
            }

            return newState;
        });
    };

    const closeChat = () => {
        setModal(false);
    };

    const handlePinToggle = (id) => {
        setPinnedId(prev =>
            prev === id ? null : id
        );
    };

    if (askForUsername) {
        return (
            <UsernamePrompt
                username={username}
                setUsername={setUsername}
                localVideoref={mediaStream.localVideoref}
                onConnect={connect}
            />
        );
    }

    if (
        hasConnected &&
        (
            socket.waitingForApproval ||
            socket.joinRejected
        )
    ) {
        return (
            <WaitingScreen
                rejected={socket.joinRejected}
            />
        );
    }

    return (
        <div className={styles.meetVideoContainer}>

            {socket.isHost && (
                <JoinRequestsPanel
                    requests={socket.pendingRequests}
                    onRespond={socket.respondToJoinRequest}
                />
            )}

            {socket.otherUserLeft && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 30,
                        color: 'white'
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{ mb: 2 }}
                    >
                        Call Ended
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mb: 3,
                            color: '#b8c4e0'
                        }}
                    >
                        The other participant has left the meeting
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() =>
                            window.location.href = "/"
                        }
                    >
                        Return to Home
                    </Button>
                </div>
            )}

            {showModal && (
                <ChatPanel
                    messages={socket.messages}
                    message={socket.message}
                    setMessage={socket.setMessage}
                    onSend={socket.sendMessage}
                    onClose={closeChat}
                />
            )}

            <div
                className={styles.mainVideoArea}
                style={{
                    width: showModal
                        ? 'calc(100% - 360px)'
                        : '100%',
                    transition: 'width 0.3s ease'
                }}
            >
                <VideoGrid
                    videos={socket.videos}
                    localVideoref={mediaStream.localVideoref}
                    localVideoOff={mediaStream.video === false}
                    localAudioOff={mediaStream.audio === false}
                    username={username}
                    localHandRaised={socket.handRaised}
                    floatingReactions={socket.floatingReactions}
                    pinnedId={pinnedId}
                    onPinToggle={handlePinToggle}
                />
            </div>

            <ControlBar
                video={mediaStream.video}
                audio={mediaStream.audio}
                screen={mediaStream.screen}
                screenAvailable={mediaStream.screenAvailable}
                handRaised={socket.handRaised}
                onToggleVideo={mediaStream.handleVideo}
                onToggleAudio={mediaStream.handleAudio}
                onToggleScreen={mediaStream.handleScreen}
                onEndCall={handleEndCall}
                onToggleChat={toggleChat}
                newMessages={socket.newMessages}
                onToggleRaiseHand={socket.handleRaiseHand}
                onSendReaction={socket.sendReaction}
                participantCount={socket.videos.length + 1}
                username={username}
                videos={socket.videos}
            />

        </div>
    );
}