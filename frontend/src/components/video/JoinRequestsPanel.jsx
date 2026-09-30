import React from 'react';
import { Card, Typography, Avatar, Button, Box } from '@mui/material';

export default function JoinRequestsPanel({ requests, onRespond }) {
    if (requests.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 300
        }}>
            {requests.map((req) => (
                <Card key={req.socketId} elevation={6} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#2D8CFF' }}>
                            {req.username ? req.username[0].toUpperCase() : "U"}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 600 }}>{req.username || "Someone"}</Typography>
                            <Typography variant="body2" color="text.secondary">wants to join</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            onClick={() => onRespond(req.socketId, true)}
                        >
                            Admit
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => onRespond(req.socketId, false)}
                        >
                            Deny
                        </Button>
                    </Box>
                </Card>
            ))}
        </div>
    );
}