import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import axios from "axios";
import jwt from "jsonwebtoken";

import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            const token = jwt.sign(
                { id: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` })
    }

}


const getUserHistory = async (req, res) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.username })
        res.json(meetings)
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { meeting_code } = req.body;

    try {
        const newMeeting = new Meeting({
            user_id: req.user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` })
    }
}

const getTurnCredentials = async (req, res) => {
    try {
        const iceServers = [
            { urls: "stun:stun.relay.metered.ca:80" },
            {
                urls: "turn:standard.relay.metered.ca:80",
                username: process.env.METERED_TURN_USERNAME,
                credential: process.env.METERED_TURN_PASSWORD,
            },
            {
                urls: "turn:standard.relay.metered.ca:80?transport=tcp",
                username: process.env.METERED_TURN_USERNAME,
                credential: process.env.METERED_TURN_PASSWORD,
            },
            {
                urls: "turn:standard.relay.metered.ca:443",
                username: process.env.METERED_TURN_USERNAME,
                credential: process.env.METERED_TURN_PASSWORD,
            },
            {
                urls: "turns:standard.relay.metered.ca:443?transport=tcp",
                username: process.env.METERED_TURN_USERNAME,
                credential: process.env.METERED_TURN_PASSWORD,
            },
        ];

        res.status(httpStatus.OK).json(iceServers);
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
};

export { login, register, getUserHistory, addToHistory, getTurnCredentials }