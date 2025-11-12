import React, { useMemo } from "react";
import SelectInput from "../SelectInput/SelectInput";
import InputField from "../InputField/InputField";

// same helpers you already have in the page
const COUNTRY_CODES = [
  { value: "+1", iso: "US", label: "US (+1)", max: 10, re: /^\d{10}$/ },
  { value: "+91", iso: "IN", label: "IN (+91)", max: 10, re: /^[6-9]\d{9}$/ },
];
const getCountryRule = (code) =>
  COUNTRY_CODES.find((c) => c.value === code) || COUNTRY_CODES[0];

const PhoneField = ({
  title = "Phone Number",
  required = false,
  value = "", // phone digits (string)
  countryCode = "+1",
  onChangeCountry, // (code) => void
  onChangePhone, // (digits) => void
  errorText = "",
}) => {
  const rule = useMemo(() => getCountryRule(countryCode), [countryCode]);

  return (
    <div className={`forminput ${errorText ? "has-error" : ""}`}>
      <span className="input-label">
        {title}
        {required && <span className="required-asterisk"> *</span>}
      </span>

      <div className="phone-field">
        <div className="phone-code">
          <SelectInput
            title=""
            value={countryCode}
            onChange={onChangeCountry}
            options={COUNTRY_CODES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            allowClear={false}
          />
        </div>

        <div className="phone-number">
          <InputField
            title=""
            placeholder="Enter phone number"
            value={value}
            onChange={(e) => onChangePhone(e?.target?.value ?? e)}
            type="text"
            maxLength={rule.max}
            onKeyDown={(e) => {
              const allowed = [
                "Backspace",
                "Delete",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End",
              ];
              if (!/[0-9]/.test(e.key) && !allowed.includes(e.key))
                e.preventDefault();
            }}
          />
        </div>
      </div>

      {errorText ? <span className="input-error-text">{errorText}</span> : null}
    </div>
  );
};

export default PhoneField;
