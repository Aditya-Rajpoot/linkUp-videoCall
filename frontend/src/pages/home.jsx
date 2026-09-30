import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Button, IconButton, TextField, Typography, Container, Box, Card } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideocamIcon from '@mui/icons-material/Videocam';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/meet/${meetingCode}`)
    }

    return (
        <>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideocamIcon color="primary" />
                        LinkUp
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate("/history")}>
                            <RestoreIcon />
                        </IconButton>
                        <Typography variant="body2">History</Typography>

                        <Button
                            onClick={() => {
                                localStorage.removeItem("token")
                                navigate("/auth")
                            }}
                            variant="outlined"
                            sx={{ ml: 2 }}
                        >
                            Logout
                        </Button>
                    </Box>

                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 4
                    }}
                >
                    <Card elevation={3} sx={{ p: 4, borderRadius: 3, flex: 1 }}>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            Providing Quality Video Call Just Like Quality Education
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                onChange={e => setMeetingCode(e.target.value)}
                                id="outlined-basic"
                                label="Meeting Code"
                                variant="outlined"
                            />
                            <Button
                                onClick={handleJoinVideoCall}
                                variant="contained"
                                size="large"
                            >
                                Join
                            </Button>
                        </Box>
                    </Card>

                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <img src="/logo3.png" alt="LinkUp" style={{ maxWidth: '100%' }} />
                    </Box>
                </Box>
            </Container>
        </>
    )
}

export default withAuth(HomeComponent)