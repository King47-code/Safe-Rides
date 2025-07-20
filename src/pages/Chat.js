import React, { useEffect, useState, useRef } from 'react';
import { initSocket } from '../api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const socketRef            = useRef(null);
  const user                 = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = initSocket();

    // Join room identified by user ID
    socketRef.current.emit('join', { userId: user.id });

    // Listen for incoming messages
    socketRef.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.id]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      from: user.name,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    // Emit to server
    socketRef.current.emit('message', msg);
    // Locally add
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="container">
      <h2>Live Chat</h2>
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '5px 0' }}>
            <strong>{m.from}</strong> <em>({m.time})</em>
            <p style={{ margin: '2px 0' }}>{m.text}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 10 }}>
        <input
          style={{ flex: 1 }}
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{ marginLeft: 8 }}>
          Send
        </button>
      </div>
    </div>
  );
}
