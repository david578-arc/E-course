import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChoosePaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');
  const userId = queryParams.get('userId');

  const redirectTo = (method) => {
    if (method === 'stripe') {
      navigate(`/payment/stripe?courseId=${courseId}&userId=${userId}`);
    } else if (method === 'qr') {
      navigate(`/payment/qr?courseId=${courseId}&userId=${userId}`);
    } else if (method === 'card') {
      navigate(`/course-enrollment?courseId=${courseId}&userId=${userId}&card=true`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Choose Payment Method</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => redirectTo('stripe')} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all">Pay with Stripe</button>
        <button onClick={() => redirectTo('qr')} className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-all">Pay with QR Code</button>
        <button onClick={() => redirectTo('card')} className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-all">Pay with Card</button>
      </div>
    </div>
  );
};

export default ChoosePaymentMethod;