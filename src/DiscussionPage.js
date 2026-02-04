import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function DiscussionPage() {
    const { courseId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8080/api/discussions/${courseId}`)
            .then((response) => response.json())
            .then((data) => setMessages(data));
    }, [courseId]);

    const handleSubmit = async () => {
        const response = await fetch('http://localhost:8080/api/discussions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, message: newMessage }),
        });

        if (response.ok) {
            setMessages([...messages, { message: newMessage }]);
            setNewMessage('');
        }
    };

    return (
        <div>
            <h2>Discussion</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.message}</li>
                ))}
            </ul>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleSubmit}>Post Message</button>
        </div>
    );
}

export default DiscussionPage;