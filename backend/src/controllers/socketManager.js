import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}
let hosts = {}           // path -> host socket id
let pendingRequests = {} // path -> { socketId: { username } }
let usernames = {}       // socketId -> username

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path, username) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }

            usernames[socket.id] = username

            // Room khaali hai -> ye user HOST banega, turant andar
            if (connections[path].length === 0) {
                hosts[path] = socket.id
                connections[path].push(socket.id)

                timeOnline[socket.id] = new Date();

                socket.emit("join-approved")
                socket.emit("you-are-host")

                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
                }

                if (messages[path] !== undefined) {
                    for (let a = 0; a < messages[path].length; ++a) {
                        io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                            messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                    }
                }

            } else {
                // Room mein pehle se log hain -> WAITING ROOM mein bhejo
                if (pendingRequests[path] === undefined) {
                    pendingRequests[path] = {}
                }
                pendingRequests[path][socket.id] = { username }

                timeOnline[socket.id] = new Date();

                socket.emit("waiting-for-approval")

                const hostId = hosts[path]
                if (hostId) {
                    io.to(hostId).emit("join-request", socket.id, username)
                }
            }

        })

        socket.on("join-response", (requesterId, approved, path) => {

            if (pendingRequests[path] && pendingRequests[path][requesterId]) {
                delete pendingRequests[path][requesterId]
            }

            if (approved) {
                if (connections[path] === undefined) {
                    connections[path] = []
                }
                connections[path].push(requesterId)

                io.to(requesterId).emit("join-approved")

                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", requesterId, connections[path])
                }

                if (messages[path] !== undefined) {
                    for (let a = 0; a < messages[path].length; ++a) {
                        io.to(requesterId).emit("chat-message", messages[path][a]['data'],
                            messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                    }
                }
            } else {
                io.to(requesterId).emit("join-rejected")
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("video-status", (status) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("video-status-update", socket.id, status)
                    }
                })
            }

        })

        socket.on("audio-status", (status) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("audio-status-update", socket.id, status)
                    }
                })
            }

        })

        socket.on("username", (username, path) => {
            usernames[socket.id] = username
            if (connections[path] !== undefined) {
                connections[path].forEach((elem) => {
                    io.to(elem).emit("user-name-update", socket.id, username)
                })
            }
        })

        socket.on("raise-hand", (status) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("raise-hand-update", socket.id, status)
                })
            }

        })

        socket.on("reaction", (emoji) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("reaction-update", socket.id, emoji)
                })
            }

        })

        socket.on("disconnect", () => {

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        // Agar host disconnect hua, to next person ko host banao
                        if (hosts[key] === socket.id) {
                            if (connections[key].length > 0) {
                                hosts[key] = connections[key][0]
                                io.to(hosts[key]).emit("you-are-host")
                            } else {
                                delete hosts[key]
                            }
                        }

                        if (connections[key].length === 0) {
                            delete connections[key]
                            delete hosts[key]
                        }
                    }
                }

            }

            // Waiting room se bhi hata do agar wahi disconnect hua
            for (const path in pendingRequests) {
                if (pendingRequests[path][socket.id]) {
                    delete pendingRequests[path][socket.id]
                }
            }

            delete usernames[socket.id]

        })


    })
    
    return io;
}