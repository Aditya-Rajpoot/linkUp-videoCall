import React from 'react';
import VideoTile from './VideoTile';
import styles from '../../styles/videoComponent.module.css';

export default function VideoGrid({
    videos, localVideoref, localVideoOff, localAudioOff, username,
    localHandRaised, floatingReactions, pinnedId, onPinToggle
}) {

    const totalParticipants = videos.length + 1;
    const columns = Math.ceil(Math.sqrt(totalParticipants));

    // Agar koi pinned hai, to pinned layout dikhao
    if (pinnedId !== null) {
        const isLocalPinned = pinnedId === 'local';
        const pinnedRemoteVideo = !isLocalPinned ? videos.find(v => v.socketId === pinnedId) : null;

        // Baaki sab tiles jo thumbnail strip mein dikhengi
        const otherVideos = videos.filter(v => v.socketId !== pinnedId);

        return (
            <div className={styles.pinnedLayout}>

                <div className={styles.pinnedMain}>
                    {isLocalPinned ? (
                        <VideoTile
                            isLocal={true}
                            videoRef={localVideoref}
                            username={username}
                            videoOff={localVideoOff}
                            audioOff={localAudioOff}
                            handRaised={localHandRaised}
                            isPinned={true}
                            onPinToggle={() => onPinToggle('local')}
                        />
                    ) : pinnedRemoteVideo ? (
                        <VideoTile
                            isLocal={false}
                            stream={pinnedRemoteVideo.stream}
                            username={pinnedRemoteVideo.username}
                            videoOff={pinnedRemoteVideo.videoOff}
                            audioOff={pinnedRemoteVideo.audioOff}
                            handRaised={pinnedRemoteVideo.handRaised}
                            isPinned={true}
                            onPinToggle={() => onPinToggle(pinnedRemoteVideo.socketId)}
                        />
                    ) : null}
                </div>

                <div className={styles.thumbnailStrip}>
                    {!isLocalPinned && (
                        <div className={styles.thumbnailTile}>
                            <VideoTile
                                isLocal={true}
                                videoRef={localVideoref}
                                username={username}
                                videoOff={localVideoOff}
                                audioOff={localAudioOff}
                                handRaised={localHandRaised}
                                onPinToggle={() => onPinToggle('local')}
                            />
                        </div>
                    )}

                    {otherVideos.map((video) => (
                        <div className={styles.thumbnailTile} key={video.socketId}>
                            <VideoTile
                                isLocal={false}
                                stream={video.stream}
                                username={video.username}
                                videoOff={video.videoOff}
                                audioOff={video.audioOff}
                                handRaised={video.handRaised}
                                onPinToggle={() => onPinToggle(video.socketId)}
                            />
                        </div>
                    ))}
                </div>

                {floatingReactions.map(r => (
                    <div key={r.id} className={styles.floatingReaction}>
                        {r.emoji}
                    </div>
                ))}
            </div>
        );
    }

    // Normal grid layout (koi pinned nahi)
    return (
        <div
            className={styles.videoGrid}
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
            <VideoTile
                isLocal={true}
                videoRef={localVideoref}
                username={username}
                videoOff={localVideoOff}
                audioOff={localAudioOff}
                handRaised={localHandRaised}
                onPinToggle={() => onPinToggle('local')}
            />

            {videos.map((video) => (
                <VideoTile
                    key={video.socketId}
                    isLocal={false}
                    stream={video.stream}
                    username={video.username}
                    videoOff={video.videoOff}
                    audioOff={video.audioOff}
                    handRaised={video.handRaised}
                    onPinToggle={() => onPinToggle(video.socketId)}
                />
            ))}

            {floatingReactions.map(r => (
                <div key={r.id} className={styles.floatingReaction}>
                    {r.emoji}
                </div>
            ))}
        </div>
    );
}