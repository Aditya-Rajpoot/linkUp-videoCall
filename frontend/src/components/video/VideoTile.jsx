import React, { useEffect } from 'react';
import { Avatar } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import PanToolIcon from '@mui/icons-material/PanTool';
import styles from '../../styles/videoComponent.module.css';

export default function VideoTile({
    videoRef,
    stream,
    isLocal,
    username,
    videoOff,
    audioOff,
    handRaised,
    isPinned,       // NAYA
    onPinToggle     // NAYA
}) {

    useEffect(() => {
        if (isLocal && videoRef && videoRef.current && window.localStream) {
            videoRef.current.srcObject = window.localStream;
        }
    }, [isLocal, videoRef, videoOff]);

    return (
        <div
            className={`${styles.videoTile} ${isPinned ? styles.pinnedTile : ''}`}
            onDoubleClick={onPinToggle}
        >
            <video
                ref={isLocal ? videoRef : (ref => {
                    if (ref && stream) ref.srcObject = stream;
                })}
                autoPlay
                muted={isLocal}
                style={{ display: videoOff ? 'none' : 'block' }}
            ></video>

            {videoOff && (
                <div className={styles.videoOffPlaceholder}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#2D8CFF', fontSize: '2rem' }}>
                        {username ? username[0].toUpperCase() : "U"}
                    </Avatar>
                </div>
            )}

            {handRaised && (
                <div className={styles.handRaisedBadge}>
                    <PanToolIcon fontSize="small" />
                </div>
            )}

            {audioOff && (
                <div className={styles.muteBadge}>
                    <MicOffIcon fontSize="small" />
                </div>
            )}

            <span className={styles.videoLabel}>{username || (isLocal ? "You" : "")}</span>
        </div>
    );
}