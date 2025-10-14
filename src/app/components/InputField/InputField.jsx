import React from "react";
import "./InputField.scss";
import { Input } from "antd";

const InputField = ({
  title,
  type,
  value,
  onChange,
  name,
  placeholder,
  onKeyDown,
  disabled,
  maxLength,
  size = "large",
  required = false,
  errorText = "",
  helperText = "",
  prefix = null,
}) => {
  const hasError = Boolean(errorText);

  return (
    <div className={`forminput ${hasError ? "has-error" : ""}`}>
      {title && (
        <span className="input-label">
          {title}
          {required && <span className="required-asterisk"> *</span>}
        </span>
      )}

      <div className="input-container">
        {type === "password" ? (
          <Input.Password
            className="input"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            maxLength={maxLength}
            disabled={disabled}
            size={size}
            prefix={prefix}
          />
        ) : (
          <Input
            className="input"
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            maxLength={maxLength}
            disabled={disabled}
            size={size}
            min={type === "number" ? 0 : undefined}
            step={type === "number" ? "any" : undefined}
            prefix={prefix}
          />
        )}
      </div>

      {/* Error or helper text */}
      {hasError ? (
        <span className="input-error-text">{errorText}</span>
      ) : (
        helperText && <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};

export default InputField;
