import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Snackbar from '@mui/material/Snackbar';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {

    const location = useLocation();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(location.state?.formState ?? 0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        try {

            if (formState === 0) {

                const result = await handleLogin(username, password);

                console.log(result);

            } else {

                const result = await handleRegister(
                    name,
                    username,
                    password
                );

                console.log(result);

                setUsername("");
                setPassword("");
                setName("");

                setMessage(result);
                setOpen(true);

                setError("");
                setFormState(0);
            }

        } catch (err) {

            console.log(err);

            const errorMessage =
                err?.response?.data?.message ||
                "Something went wrong";

            setError(errorMessage);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>

            <CssBaseline />

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                }}
            >

                <Container maxWidth="xs">

                    <Card elevation={6} sx={{ p: 4, borderRadius: 3 }}>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >

                            <Avatar
                                sx={{
                                    m: 1,
                                    bgcolor: 'primary.main'
                                }}
                            >
                                <LockOutlinedIcon />
                            </Avatar>

                            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                                Welcome to LinkUp
                            </Typography>

                            <ToggleButtonGroup
                                value={formState}
                                exclusive
                                onChange={(e, newState) => {
                                    if (newState !== null) {
                                        setFormState(newState);
                                        setError("");
                                    }
                                }}
                                fullWidth
                                sx={{ mb: 3, width: '100%' }}
                            >
                                <ToggleButton value={0} sx={{ width: '50%' }}>
                                    Sign In
                                </ToggleButton>
                                <ToggleButton value={1} sx={{ width: '50%' }}>
                                    Sign Up
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <Box
                                component="form"
                                noValidate
                                sx={{ width: '100%' }}
                            >

                                {formState === 1 && (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Full Name"
                                        name="name"
                                        value={name}
                                        autoFocus
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                )}

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    value={username}
                                    autoFocus={formState === 0}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    value={password}
                                    type="password"
                                    id="password"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                                {error && (
                                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                        {error}
                                    </Typography>
                                )}

                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{ mt: 3, mb: 1 }}
                                    onClick={handleAuth}
                                >
                                    {formState === 0
                                        ? "Login"
                                        : "Register"}
                                </Button>

                            </Box>

                        </Box>

                    </Card>

                </Container>

            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />

        </ThemeProvider>
    );
}