import React from 'react'
import "../styles/landing.css"
import { useNavigate } from 'react-router-dom'
import VideocamIcon from '@mui/icons-material/Videocam';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import LockIcon from '@mui/icons-material/Lock';
import generateMeetingId from '../utils/generateMeetingId';

export default function LandingPage() {

    const router = useNavigate();

    const handleGuestJoin = () => {
        const meetingId = generateMeetingId();
        router(`/meet/${meetingId}`);
    }

    return (
        <div className="lp-page">

            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo">
                        <div className="lp-logo-mark">
                            <VideocamIcon sx={{ color: 'white', fontSize: 20 }} />
                        </div>
                        <span className="lp-logo-word">LinkUp</span>
                    </div>

                    <div className="lp-nav-links">
                        <span className="lp-nav-link" onClick={handleGuestJoin}>
                            Join as guest
                        </span>
                        <span className="lp-nav-link" onClick={() => router("/auth", { state: { formState: 0 } })}>
                            Log in
                        </span>
                        <button className="lp-nav-cta" onClick={() => router("/auth", { state: { formState: 1 } })}>
                            Register
                        </button>
                    </div>
                </div>
            </nav>

            <section className="lp-hero">
                <div className="lp-hero-inner">
                    <div className="lp-hero-text">
                        <h1 className="lp-hero-title">
                            Stay close, no matter the distance.
                        </h1>
                        <p className="lp-hero-sub">
                            LinkUp is a free video room for the people you actually want to see —
                            start a call in seconds, no download and no account needed to join one.
                        </p>
                        <div className="lp-hero-actions">
                            <button
                                className="lp-btn-primary"
                                onClick={() => router("/auth", { state: { formState: 1 } })}
                            >
                                Create an account
                            </button>
                            <button
                                className="lp-btn-secondary"
                                onClick={handleGuestJoin}
                            >
                                Join with a code
                            </button>
                        </div>
                    </div>

                    <div className="lp-hero-graphic" aria-hidden="true">
                        <svg viewBox="0 0 400 400" className="lp-graphic-svg">
                            <line x1="200" y1="200" x2="90" y2="110" className="lp-link lp-link-a" />
                            <line x1="200" y1="200" x2="310" y2="90" className="lp-link lp-link-b" />
                            <line x1="200" y1="200" x2="320" y2="270" className="lp-link lp-link-c" />
                            <line x1="200" y1="200" x2="95" y2="300" className="lp-link lp-link-d" />

                            <circle cx="90" cy="110" r="26" className="lp-node lp-node-a" />
                            <circle cx="310" cy="90" r="20" className="lp-node lp-node-b" />
                            <circle cx="320" cy="270" r="22" className="lp-node lp-node-c" />
                            <circle cx="95" cy="300" r="18" className="lp-node lp-node-d" />

                            <circle cx="200" cy="200" r="38" className="lp-node lp-node-center" />
                        </svg>
                    </div>
                </div>
            </section>

            <section className="lp-features">
                <div className="lp-section-head">
                    <h2 className="lp-section-title">Everything a call needs, nothing it doesn't</h2>
                </div>

                <div className="lp-feature-list">
                    <div className="lp-feature-row">
                        <div className="lp-feature-icon">
                            <VideocamIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div>
                            <h3 className="lp-feature-title">HD video</h3>
                            <p className="lp-feature-desc">Sharp, stable video that holds up even on an average connection.</p>
                        </div>
                    </div>

                    <div className="lp-feature-row">
                        <div className="lp-feature-icon">
                            <ScreenShareIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div>
                            <h3 className="lp-feature-title">Screen sharing</h3>
                            <p className="lp-feature-desc">Show your screen the moment you need to, no extra setup.</p>
                        </div>
                    </div>

                    <div className="lp-feature-row">
                        <div className="lp-feature-icon">
                            <ChatIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div>
                            <h3 className="lp-feature-title">Live chat</h3>
                            <p className="lp-feature-desc">Send a message mid-call without breaking the conversation.</p>
                        </div>
                    </div>

                    <div className="lp-feature-row">
                        <div className="lp-feature-icon">
                            <LockIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div>
                            <h3 className="lp-feature-title">Private by default</h3>
                            <p className="lp-feature-desc">Every room is locked to a link — nobody else can drop in.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-steps">
                <div className="lp-section-head">
                    <h2 className="lp-section-title">How it works</h2>
                </div>

                <div className="lp-steps-inner">
                    <div className="lp-step">
                        <span className="lp-step-number">1</span>
                        <h3 className="lp-step-title">Create a room</h3>
                        <p className="lp-step-desc">Sign up and generate a private link in one click.</p>
                    </div>
                    <div className="lp-step">
                        <span className="lp-step-number">2</span>
                        <h3 className="lp-step-title">Share the link</h3>
                        <p className="lp-step-desc">Send it to anyone — they can join straight from the browser.</p>
                    </div>
                    <div className="lp-step">
                        <span className="lp-step-number">3</span>
                        <h3 className="lp-step-title">Talk face to face</h3>
                        <p className="lp-step-desc">No downloads. Just open the link and you're in.</p>
                    </div>
                </div>
            </section>

            <section className="lp-cta-band">
                <div className="lp-cta-inner">
                    <h2 className="lp-cta-title">Your next call is one link away.</h2>
                    <button
                        className="lp-btn-primary"
                        onClick={() => router("/auth", { state: { formState: 1 } })}
                    >
                        Create your first room
                    </button>
                </div>
            </section>

            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <span className="lp-logo-word" style={{ fontSize: '1rem' }}>LinkUp</span>
                    <span className="lp-footer-note">Built for conversations that matter.</span>
                </div>
            </footer>

        </div>
    )
}