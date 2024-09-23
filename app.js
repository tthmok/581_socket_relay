const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connections by secret name
const connections = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a client provides a secret name
    socket.on('register', (secretName) => {
        console.log(`Device registered with secret name: ${secretName}`);

        if (!connections[secretName]) {
            connections[secretName] = [];
        }
        connections[secretName].push(socket);

        // If the socket disconnects, remove it from the connections list
        socket.on('disconnect', () => {
            connections[secretName] = connections[secretName].filter(s => s !== socket);
            console.log(`Device with secret name ${secretName} disconnected.`);
        });
    });

    // Relay messages between devices with the same secret name
    socket.on('message', (data) => {
        const { secretName, message } = data;
        console.log(`Message received for secret name ${secretName}: ${message}`);

        if (connections[secretName]) {
            // Send the message to all devices registered with this secret name
            connections[secretName].forEach((clientSocket) => {
                if (clientSocket !== socket) {
                    clientSocket.emit('message', message);
                }
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
