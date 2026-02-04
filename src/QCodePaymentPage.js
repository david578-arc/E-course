import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Corrected import
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const QCodePaymentPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');
  const userId = queryParams.get('userId');

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleConfirmPayment = async () => {
    try {
      await axios.post(`/enrollments/${userId}/${courseId}/payment`, {
        amount: course.price,
        currency: 'usd',
        email: localStorage.getItem('email'),
      });
      toast.success("Payment Confirmed! You're enrolled.");
    } catch (err) {
      toast.error("Payment confirmation failed.");
    }
  };

  if (loading) return <div className="text-center p-6">Loading course...</div>;
  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Scan to Pay via QR</h2>
      {course && (
        <>
          <QRCodeSVG
            size={256}
            value={`upi://pay?pa=demo@upi&pn=CoursePayment&am=${course.price}`}
          />
          <p className="mt-2 text-gray-600">Course: {course.title}</p>
          <p className="text-gray-600">Amount: ${course.price}</p>
          <button
            onClick={handleConfirmPayment}
            className="bg-purple-700 text-white mt-6 px-6 py-2 rounded hover:bg-purple-800 transition"
          >
            Mark as Paid
          </button>
        </>
      )}
    </div>
  );
};

export default QCodePaymentPage;
