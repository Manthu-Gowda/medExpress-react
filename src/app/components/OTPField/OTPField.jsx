import { useEffect, useMemo, useRef } from "react";
import "./OTPField.scss";
import PropTypes from "prop-types";

const OTPField = ({
  title,
  name = "otp",
  length = 4,
  value = "",
  onChange,
  required = false,
  errorText = "",
  helperText = "",
  autoFocus = true,
  disabled = false,
}) => {
  const hasError = Boolean(errorText);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) inputsRef.current[0].focus();
  }, [autoFocus]);

  const chars = useMemo(() => {
    const arr = new Array(length).fill("");
    value
      .slice(0, length)
      .split("")
      .forEach((c, i) => (arr[i] = c));
    return arr;
  }, [value, length]);

  const setAt = (i, c) => {
    const digits = c.replace(/\D/g, "");
    const next = chars.slice();

    if (!digits) {
      next[i] = "";
      onChange?.({ target: { name, value: next.join("") } });
      return;
    }

    next[i] = digits[0];
    // spill remaining to next boxes (mobile paste/type)
    let idx = i + 1;
    for (const rest of digits.slice(1)) {
      if (idx < length) next[idx++] = rest;
    }
    onChange?.({ target: { name, value: next.join("") } });
  };

  const handleChange = (e, i) => {
    setAt(i, e.target.value);
    if (/\d/.test(e.target.value) && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      if (chars[i]) {
        setAt(i, "");
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        setTimeout(() => setAt(i - 1, ""), 0);
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e, i) => {
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = chars.slice();
    let idx = i;
    for (const c of pasted) {
      if (idx < length) next[idx++] = c;
      else break;
    }
    onChange?.({ target: { name, value: next.join("") } });
    inputsRef.current[Math.min(i + pasted.length - 1, length - 1)]?.focus();
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div className={`forminput ${hasError ? "has-error" : ""}`}>
      {title && (
        <span className="input-label">
          {title}
          {required && <span className="required-asterisk"> *</span>}
        </span>
      )}

      <div className="otpinput">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="otpinput__box"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d*"
            maxLength={1}
            value={chars[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            onFocus={handleFocus}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {hasError ? (
        <span className="input-error-text">{errorText}</span>
      ) : (
        helperText && <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};

OTPField.propTypes = {
  title: PropTypes.string,
  name: PropTypes.string,
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  errorText: PropTypes.string,
  helperText: PropTypes.string,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default OTPField;
