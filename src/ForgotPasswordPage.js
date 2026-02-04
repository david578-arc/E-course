import React, { useState } from 'react';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            alert('Password reset link sent to your email');
        } else {
            alert('Failed to send reset link');
        }
    };

    return (
        <div className="container">
            <h2>Forgot Password</h2>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleResetPassword}>Reset Password</button>
        </div>
    );
}

export default ForgotPasswordPage;