import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { AppBar, Toolbar, IconButton, Container, Box, Button, CircularProgress, Tooltip } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EventIcon from '@mui/icons-material/Event';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LoginIcon from '@mui/icons-material/Login';

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings([...history].reverse());
            } catch {
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} · ${hours}:${minutes}`
    }

    const handleRejoin = (meetingCode) => {
        routeTo(`/meet/${meetingCode}`);
    }

    const handleCopyCode = async (meetingCode) => {
        try {
            await navigator.clipboard.writeText(meetingCode);
            setCopiedCode(meetingCode);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton onClick={() => routeTo("/home")}>
                        <HomeIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Meeting History
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ mt: 4 }}>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : meetings.length !== 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {meetings.map((e, i) => (
                            <Card key={i} elevation={2} sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <VideoCallIcon color="primary" fontSize="large" />

                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            Code: {e.meetingCode}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <EventIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(e.date)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Tooltip title={copiedCode === e.meetingCode ? "Copied!" : "Copy code"}>
                                        <IconButton onClick={() => handleCopyCode(e.meetingCode)} size="small">
                                            {copiedCode === e.meetingCode ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<LoginIcon />}
                                        onClick={() => handleRejoin(e.meetingCode)}
                                    >
                                        Rejoin
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                            No meeting history yet
                        </Typography>
                    </Box>
                )}

            </Container>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    Failed to load meeting history
                </Alert>
            </Snackbar>
        </>
    )
}