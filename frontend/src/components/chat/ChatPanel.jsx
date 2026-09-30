import React from 'react';
import { IconButton, TextField, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from '../../styles/videoComponent.module.css';

export default function ChatPanel({ messages, message, setMessage, onSend, onClose }) {
    return (
        <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5">Chat</Typography>
                    <IconButton onClick={onClose} style={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className={styles.chattingDisplay}>
                    {messages.length !== 0 ? messages.map((item, index) => (
                        <div style={{ marginBottom: "16px" }} key={index}>
                            <Typography style={{ fontWeight: "bold", fontSize: "0.85rem", color: '#8ab4ff' }}>
                                {item.sender}
                            </Typography>
                            <Typography style={{ fontSize: "0.9rem", color: 'white' }}>
                                {item.data}
                            </Typography>
                        </div>
                    )) : <Typography style={{ color: '#b8c4e0' }}>No Messages Yet</Typography>}
                </div>

                <div className={styles.chattingArea}>
                    <TextField
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message"
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiInputBase-input': { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#2D8CFF' },
                            },
                            '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 }
                        }}
                    />
                    <Button variant='contained' onClick={onSend}>Send</Button>
                </div>
            </div>
        </div>
    );
}