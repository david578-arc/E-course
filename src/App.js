import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Core Pages
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import HomePage from './HomePage';
import ForgotPasswordPage from './ForgotPasswordPage';
import CompleteprofilePage from './CompleteprofilePage';
import NotificationsPage from './NotificationsPage';
import OAuth2SuccessPage from './OAuth2SuccessPage';
import AnalyticsPage from './AnalyticsPage';

// Course-related Pages
import CourseDetails from './CourseDetails';
import CourseEnrollment from './CourseEnrollment';
import DiscussionPage from './DiscussionPage';
import CertificatePage from './CertificatePage';
import ProfilePage from './ProfilePage';
import QuizPage from './QuizPage';

// Payment Pages
import ChoosePayment from './ChoosePayment';
import QCodePaymentPage from './QCodePaymentPage';
import StripePaymentPage from './StripePaymentPage';
import CardPaymentPage from './CardPaymentPage';

// Admin Pages
import AdminHomepage from './AdminHomepage';
import AdminDashboard from './AdminDashboard';
import AdminTransactionsPage from './AdminTransactionsPage';
import Admincourse from './Admincourse';
import AnalyticsDashboard from './AnalyticsDashboard';
import AdminUserManagement from './AdminUserManagement'; // or './components/AdminUserManagement';


function App() {
  return (
    <Routes>
      {/* Auth and Landing */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/Register" element={<RegisterPage />} />
      <Route path="/Home" element={<HomePage />} />
      <Route path="/Forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/complete-profile" element={<CompleteprofilePage />} />
      <Route path="/notification" element={<NotificationsPage />} />
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
      <Route path="/auth/google-login" element={<LoginPage />} />
       <Route path="/Analytics" element={<AnalyticsPage />} />

      {/* Course and Enrollment */}
      <Route path="/coursedeatils/:courseId" element={<CourseDetails />} />
      <Route path="/Profile" element={<ProfilePage />} />
      <Route path="/enrollment/:courseId" element={<CourseEnrollment />} />
      <Route path="/quiz/:courseId" element={<QuizPage />} />
      <Route path="/discussion/:courseId" element={<DiscussionPage />} />
      <Route path="/certificates/:courseId" element={<CertificatePage />} />

      {/* Payment */}
      <Route path="/choose-payment" element={<ChoosePayment />} />
      <Route path="/pay/qr" element={<QCodePaymentPage />} />
      <Route path="/pay/stripe" element={<StripePaymentPage />} />
      <Route path="/card-payment" element={<CardPaymentPage />} />

      {/* Admin */}
      <Route path="/adminhome" element={<AdminHomepage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admintransactions" element={<AdminTransactionsPage />} />
      <Route path="/admincourse" element={<Admincourse />} />
      <Route path="/analyticsdashboard" element={<AnalyticsDashboard />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />

    </Routes>
  );
}

export default App; 