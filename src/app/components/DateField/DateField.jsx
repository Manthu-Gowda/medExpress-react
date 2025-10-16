import React from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import "./DateField.scss";

/**
 * Same structure/UX as InputField, but wraps AntD DatePicker.
 */
const DateField = ({
  title,
  value,                 // dayjs | null
  onChange,              // (dayjs|null,dateString) => void
  name,
  placeholder = "DD - MM - YYYY",
  required = false,
  disabled = false,
  errorText = "",
  helperText = "",
  size = "large",
  format = "DD-MM-YYYY",
  disabledDate,          // (current) => boolean
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
        <DatePicker
          className="date-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          format={format}
          allowClear
          disabledDate={disabledDate}
        />
      </div>

      {hasError ? (
        <span className="input-error-text">{errorText}</span>
      ) : (
        helperText && <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};

export default DateField;
