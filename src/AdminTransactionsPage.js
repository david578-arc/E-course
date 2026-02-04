import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminTransactionsPage = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get('/admin/payments')
      .then(res => setPayments(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Transactions</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>User ID</th>
            <th>Course ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="text-center border-t">
              <td>{p.id}</td>
              <td>{p.userId}</td>
              <td>{p.courseId}</td>
              <td>${p.amount}</td>
              <td>{p.status}</td>
              <td>{p.paymentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTransactionsPage;
