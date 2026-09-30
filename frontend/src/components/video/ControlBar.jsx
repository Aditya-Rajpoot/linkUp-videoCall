import React, { useState } from 'react';
import { IconButton } from '@mui/material';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PanToolIcon from '@mui/icons-material/PanTool';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GroupIcon from '@mui/icons-material/Group';

import styles from '../../styles/videoComponent.module.css';

const REACTIONS = [
    "👍",
    "❤️",
    "😂",
    "👏",
    "🎉",
    "😡"
];

export default function ControlBar({
    video,
    audio,
    screen,
    screenAvailable,
    handRaised,
    onToggleVideo,
    onToggleAudio,
    onToggleScreen,
    onEndCall,
    onToggleChat,
    newMessages,
    onToggleRaiseHand,
    onSendReaction,
    participantCount,
    username,
    videos
}) {
    const [showReactions, setShowReactions] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(
                window.location.href
            );

            setLinkCopied(true);

            setTimeout(() => {
                setLinkCopied(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Failed to copy meeting link:",
                error
            );
        }
    };

    const handleReaction = (emoji) => {
        onSendReaction(emoji);
        setShowReactions(false);
    };

    const participants = [
        {
            socketId: "local",
            username: username || "You"
        },
        ...(videos || []).map(video => ({
            socketId: video.socketId,
            username: video.username || "Guest"
        }))
    ];

    return (
        <div className={styles.buttonContainers}>

            <div className={styles.controlsLeft}>
                <div className={styles.participantWrapper}>

                    <button
                        className={styles.participantCount}
                        onClick={() =>
                            setShowParticipants(prev => !prev)
                        }
                    >
                        <GroupIcon fontSize="small" />
                        <span>{participantCount}</span>
                    </button>

                    {showParticipants && (
                        <div className={styles.participantPopup}>

                            <div className={styles.participantPopupHeader}>
                                <span>Participants</span>
                                <span>{participantCount}</span>
                            </div>

                            <div className={styles.participantList}>
                                {participants.map(participant => (
                                    <div
                                        className={styles.participantItem}
                                        key={participant.socketId}
                                    >
                                        <div className={styles.participantAvatar}>
                                            {participant.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className={styles.participantName}>
                                            <span>
                                                {participant.username}
                                            </span>

                                            {participant.socketId === "local" && (
                                                <span className={styles.youLabel}>
                                                    You
                                                </span>
                                            )}
                                        </div>

                                        <span className={styles.onlineDot}></span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}

                </div>
            </div>

            <div className={styles.controlsCenter}>

                <IconButton
                    onClick={onToggleVideo}
                    style={{ color: "white" }}
                    title="Camera"
                >
                    {video ? (
                        <VideocamIcon />
                    ) : (
                        <VideocamOffIcon />
                    )}
                </IconButton>

                <IconButton
                    onClick={onToggleAudio}
                    style={{ color: "white" }}
                    title="Microphone"
                >
                    {audio ? (
                        <MicIcon />
                    ) : (
                        <MicOffIcon />
                    )}
                </IconButton>

                {screenAvailable && (
                    <IconButton
                        onClick={onToggleScreen}
                        style={{ color: "white" }}
                        title="Screen share"
                    >
                        {screen ? (
                            <ScreenShareIcon />
                        ) : (
                            <StopScreenShareIcon />
                        )}
                    </IconButton>
                )}

                <div className={styles.reactionButtonWrapper}>

                    <IconButton
                        onClick={() =>
                            setShowReactions(prev => !prev)
                        }
                        style={{ color: "white" }}
                        title="Reactions"
                    >
                        <EmojiEmotionsIcon />
                    </IconButton>

                    {showReactions && (
                        <div className={styles.reactionPicker}>
                            {REACTIONS.map(emoji => (
                                <span
                                    key={emoji}
                                    className={styles.reactionOption}
                                    onClick={() =>
                                        handleReaction(emoji)
                                    }
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    )}

                </div>

                <IconButton
                    onClick={onToggleRaiseHand}
                    style={{
                        color: handRaised
                            ? "#FFD700"
                            : "white"
                    }}
                    title="Raise hand"
                >
                    <PanToolIcon />
                </IconButton>

                <IconButton
                    onClick={onEndCall}
                    style={{
                        color: "white",
                        backgroundColor: "#ef4444",
                        marginLeft: "4px",
                        width: "46px",
                        height: "46px"
                    }}
                    title="End call"
                >
                    <CallEndIcon />
                </IconButton>

            </div>

            <div className={styles.controlsRight}>

                <button
                    className={styles.bottomAction}
                    onClick={onToggleChat}
                    title="Chat"
                >
                    <ChatIcon />
                    <span>Chat</span>
                </button>

                <button
                    className={styles.bottomAction}
                    onClick={handleCopyLink}
                    title="Copy meeting link"
                >
                    {linkCopied ? (
                        <CheckIcon />
                    ) : (
                        <ContentCopyIcon />
                    )}

                    <span>
                        {linkCopied ? "Copied" : "Copy"}
                    </span>
                </button>

            </div>

        </div>
    );
}