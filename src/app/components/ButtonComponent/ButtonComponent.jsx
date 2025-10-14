import React from "react";
import "./ButtonComponent.scss";

const ButtonComponent = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  style
}) => {
  return (
    <button
      type={type}
      className={`custom-button ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default ButtonComponent;
