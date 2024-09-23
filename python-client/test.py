#!/bin/env python

import socketio
import random

# Create a Socket.IO client
sio = socketio.Client()

# Define the secret name to use for this client
secret_name = "mySecretName"

# Connect to the Node.js server
sio.connect('http://localhost:3000')

# Register with the secret name
@sio.event
def connect():
    print("Connect to server")
    sio.emit('register', secret_name)

# Gracefully handle disconnection
def disconnect():
    print("Disconnecting from server")
    sio.disconnect()

# Handle incoming messages
@sio.on('message')
def on_message(data):
    print(f"Message received: {data}")

# Send a message
def send_message(msg):
    sio.emit('message', {'secretName': secret_name, 'message': msg})

# Keep the client running to receive messages
if __name__ == "__main__":
    try:
        connect()
        send_message("Hello from device 1: " + str(random.randint(0,1000)))
        sio.wait()
    except KeyboardInterrupt:
        print("Quitting")
        disconnect()