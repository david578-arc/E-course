import React from 'react';

const CertificateTemplate = ({ userName, courseTitle, issueDate }) => {
    return (
        <div className="certificate-container">
            <h1>Certificate of Completion</h1>
            <p>This certifies that</p>
            <h2>{userName}</h2>
            <p>has successfully completed the course</p>
            <h3>{courseTitle}</h3>
            <p>on <span>{issueDate}</span>.</p>
            <img src="https://example.com/signature.png" alt="Signature" className="signature" />
        </div>
    );
};

export default CertificateTemplate;