// AuthContainer.jsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPVerificationForm from './OTPVerificationForm';
import CompanyLogo from './CompanyLogo';
import './AuthStyles.css';


function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [emailParaOTP, setEmailParaOTP] = useState('');
  
  const switchView = () => {
    setIsLogin(!isLogin);
  };

  const handleOTPRequired = (email) => {
    setEmailParaOTP(email);
    setShowOTP(true);
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setEmailParaOTP('');
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <CompanyLogo />
        
        {showOTP ? (
          <OTPVerificationForm 
            email={emailParaOTP} 
            onBackToLogin={handleBackToLogin}
          />
        ) : isLogin ? (
          <LoginForm 
            switchToRegister={switchView}
            onOTPRequired={handleOTPRequired}
          />
        ) : (
          <RegisterForm switchToLogin={switchView} />
        )}
      </div>
    
    </div>
  );
}

export default AuthContainer;