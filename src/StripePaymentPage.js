import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StripePaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');
  const userId = queryParams.get('userId');

  useEffect(() => {
    if (!courseId || !userId) {
      toast.error('Missing course or user information.');
      navigate('/course-enrollment');
      return;
    }

    const initiateStripe = async () => {
      try {
        const email = localStorage.getItem('email');
        const res = await axios.post('/stripe/create-checkout-session', {
          courseId,
          userId,
          email,
        });

        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error('No redirect URL received');
        }
      } catch (err) {
        console.error('Stripe initiation failed:', err);
        toast.error("Failed to initiate Stripe payment.");
        setTimeout(() => navigate('/course-enrollment'), 2000);
      }
    };

    initiateStripe();
  }, [courseId, userId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen animate-pulse">
      <p className="text-xl font-medium text-gray-700">Redirecting to Stripe Checkout...</p>
    </div>
  );
};

export default StripePaymentPage;
