// CardPaymentPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './CardPaymentPage.css'; // You can style as needed

const CardPaymentPage = () => {
  const location = useLocation();
  const { course, userId } = location.state || {};

  const handlePayment = (e) => {
    e.preventDefault();
    alert(`Payment successful for course: ${course?.title}`);
    // Logic to handle backend payment goes here
  };

  return (
    <div className="card-payment-page">
      <h1>Card Payment</h1>
      <p>Course: {course?.title}</p>
      <p>Amount: ₹{course?.price}</p>

      <form className="card-form" onSubmit={handlePayment}>
        <input type="text" placeholder="Cardholder Name" required />
        <input type="text" placeholder="Card Number" maxLength="16" required />
        <input type="text" placeholder="MM/YY" maxLength="5" required />
        <input type="text" placeholder="CVV" maxLength="3" required />
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

export default CardPaymentPage;
