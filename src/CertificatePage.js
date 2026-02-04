import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { useParams } from 'react-router-dom';
import CertificateTemplate from './CertificateTemplate';

function CertificatePage() {
    const { courseId } = useParams(); // get courseId from URL params
    const userId = 1; // Replace with actual user ID from context or state
    const [certificateData, setCertificateData] = useState(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificateDetails = async () => {
            try {
                // First try to fetch existing certificate
                const getResponse = await axios.get(`http://localhost:8080/certificates/${userId}/${courseId}`);

                if (getResponse.data) {
                    setCertificateData(getResponse.data);
                } else {
                    // If no certificate exists, create one
                    const postResponse = await axios.post('http://localhost:8080/certificates', {
                        user: { id: userId },
                        course: { id: parseInt(courseId) },
                    });

                    setCertificateData(postResponse.data);
                }
            } catch (error) {
                console.error('Failed to fetch or create certificate:', error);
                alert('Something went wrong. Please try again.');
            }
        };

        fetchCertificateDetails();
    }, [courseId]);

    const downloadCertificate = () => {
        const input = certificateRef.current;
        if (!input) {
            alert('Certificate template not found!');
            return;
        }

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'certificate.png';
            link.click();
        });
    };

    if (!certificateData) {
        return <p>Loading certificate details...</p>;
    }

    return (
        <div>
            <div ref={certificateRef}>
                <CertificateTemplate
                    userName={certificateData.user.name}
                    courseTitle={certificateData.course.title}
                    issueDate={certificateData.issueDate}
                />
            </div>
            <button onClick={downloadCertificate} className="download-button">
                Download Certificate
            </button>
        </div>
    );
}

export default CertificatePage;
