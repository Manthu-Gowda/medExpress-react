// src/pages/payment/PaymentCancel.jsx
import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./PaymentCancel.scss";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payResult">
      <div className="payResult__card cancel">
        <div className="payResult__glow" />
        <div className="payResult__icon cancelIcon">
          {/* Animated cross SVG */}
          <svg viewBox="0 0 52 52" className="cross">
            <circle className="cross__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="cross__line cross__line--left" d="M16 16 L36 36" />
            <path className="cross__line cross__line--right" d="M36 16 L16 36" />
          </svg>
        </div>

        <h1 className="payResult__title">Payment Cancelled</h1>
        <p className="payResult__subtitle">
          No charges were made. You can try again anytime.
        </p>

        <div className="payResult__actions">
          <Button type="primary" size="large" onClick={() => navigate("/patients")}>
            Go back to Patients
          </Button>
          <Button size="large" onClick={() => navigate("/subscription")}>
            Retry Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
