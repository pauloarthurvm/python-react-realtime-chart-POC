import time
import random
from flask import Flask, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

def send_random_numbers(sid):
    """Send 10 random numbers (one per second) only to a specific client."""
    for _ in range(10):
        random_number = random.randint(1, 100)
        print(f"Sending to Client {sid} the number {random_number}")
        socketio.emit('random_number', {'number': random_number}, to=sid)
        time.sleep(1)

def send_random_numbers_all(sender_sid):
    """Broadcast 10 random numbers (one per second) to all clients,
       including the sender's client ID in each message."""
    for _ in range(10):
        random_number = random.randint(1, 100)
        print(f"Broadcasting from Client {sender_sid}: number {random_number}")
        socketio.emit('global_random_number', {'clientID': sender_sid, 'number': random_number})
        time.sleep(1)

@socketio.on('client_message')
def handle_client_message(data):
    print(f"Received message from client {request.sid}: {data}")
    # Start a background task to send numbers only to this client.
    socketio.start_background_task(send_random_numbers, request.sid)

@socketio.on('client_message_all')
def handle_client_message_all(data):
    print(f"Received broadcast trigger from client {request.sid}: {data}")
    # Start a background task to broadcast numbers to all clients.
    socketio.start_background_task(send_random_numbers_all, request.sid)

@socketio.on('connect')
def on_connect():
    print(f"Client connected: {request.sid}")
    emit('message', {'data': 'Welcome! Send a message to start receiving random numbers.'})

@socketio.on('disconnect')
def on_disconnect():
    print(f"Client disconnected: {request.sid}")

if __name__ == '__main__':
    # Note: allow_unsafe_werkzeug=True is needed if you run in debug mode.
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
