import React, { useEffect, useState } from 'react';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [emailData, setEmailData] = useState({ username: '', subject: '', body: '' });
    const [smsData, setSmsData] = useState({ username: '', message: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/notifications')
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                } else {
                    console.error("Expected an array of notifications");
                }
            })
            .catch((error) => console.error("Fetch error:", error));
    }, []);

    const handleEmailChange = (e) => {
        setEmailData({ ...emailData, [e.target.name]: e.target.value });
    };

    const handleSmsChange = (e) => {
        setSmsData({ ...smsData, [e.target.name]: e.target.value });
    };

    const sendEmail = () => {
        fetch('http://localhost:8080/notifications/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
        })
            .then((res) => res.text())
            .then((msg) => {
                setMessage(msg);
                setEmailData({ username: '', subject: '', body: '' });
            })
            .catch((err) => setMessage("Failed to send email: " + err));
    };

    const sendSms = () => {
        fetch('http://localhost:8080/notifications/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(smsData),
        })
            .then((res) => res.text())
            .then((msg) => {
                setMessage(msg);
                setSmsData({ username: '', message: '' });
            })
            .catch((err) => setMessage("Failed to send SMS: " + err));
    };

    return (
        <div className="container" style={{ padding: "20px" }}>
            <h2>Notifications</h2>

            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>
                        {notification.message} <br />
                        <small>{new Date(notification.timestamp).toLocaleString()}</small>
                    </li>
                ))}
            </ul>

            <hr />

            <h3>Send Email</h3>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={emailData.username}
                onChange={handleEmailChange}
            />
            <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={emailData.subject}
                onChange={handleEmailChange}
            />
            <textarea
                name="body"
                placeholder="Message"
                value={emailData.body}
                onChange={handleEmailChange}
            />
            <button onClick={sendEmail}>Send Email</button>

            <hr />

            <h3>Send SMS</h3>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={smsData.username}
                onChange={handleSmsChange}
            />
            <textarea
                name="message"
                placeholder="Message"
                value={smsData.message}
                onChange={handleSmsChange}
            />
            <button onClick={sendSms}>Send SMS</button>

            <hr />
            {message && <div><strong>Status:</strong> {message}</div>}
        </div>
    );
}

export default NotificationsPage;

