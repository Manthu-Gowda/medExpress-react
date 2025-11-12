// src/pages/payment/PaymentSuccess.jsx
import React, { useEffect } from "react";
import { Button } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.scss";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id"); // optional: use if you want to verify

  useEffect(() => {
    // Optional: you can call your backend to verify sessionId and update UI/state
    // verifyCheckoutSession(sessionId)
  }, [sessionId]);

  return (
    <div className="payResult">
      <div className="payResult__card success">
        <div className="payResult__burst" />
        <div className="payResult__icon successIcon">
          {/* Animated checkmark SVG */}
          <svg viewBox="0 0 52 52" className="check">
            <circle className="check__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="check__check" fill="none" d="M14 27l7 7 17-17" />
          </svg>
        </div>

        <h1 className="payResult__title">Payment Successful</h1>
        <p className="payResult__subtitle">
          Your subscription has been activated. Thank you!
        </p>

        <div className="payResult__actions">
          <Button type="primary" size="large" onClick={() => navigate("/patients")}>
            Go back to Patients
          </Button>
          <Button size="large" onClick={() => navigate("/orders")}>
            View Subscriptions
          </Button>
        </div>
      </div>

      {/* floating confetti */}
      <div className="confetti confetti--1" />
      <div className="confetti confetti--2" />
      <div className="confetti confetti--3" />
      <div className="confetti confetti--4" />
      <div className="confetti confetti--5" />
    </div>
  );
};

export default PaymentSuccess;
