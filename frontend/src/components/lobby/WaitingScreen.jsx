import React from 'react';
import { Container, Card, Typography, CircularProgress, Button, Box } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

export default function WaitingScreen({ rejected }) {
    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Card elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                {rejected ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <BlockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Join request denied
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            The host didn't let you into this meeting.
                        </Typography>
                        <Button variant="contained" onClick={() => window.location.href = "/"}>
                            Return to Home
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress sx={{ mb: 3 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Waiting for host to let you in
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please wait, someone in the meeting will admit you soon.
                        </Typography>
                    </Box>
                )}
            </Card>
        </Container>
    );
}