import React from 'react';
import { Avatar, Card, Container, TextField, Typography, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';

export default function UsernamePrompt({ username, setUsername, localVideoref, onConnect }) {
    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Card elevation={6} sx={{ p: 4, borderRadius: 3 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <VideocamIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Enter into Lobby
                    </Typography>

                    <video
                        ref={localVideoref}
                        autoPlay
                        muted
                        style={{
                            width: '100%',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            backgroundColor: '#000'
                        }}
                    ></video>

                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={onConnect}
                    >
                        Connect
                    </Button>

                </div>
            </Card>
        </Container>
    );
}