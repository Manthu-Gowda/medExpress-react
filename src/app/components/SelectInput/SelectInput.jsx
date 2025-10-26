// SelectInput.jsx
import React from "react";
import { Select } from "antd";
import "./SelectInput.scss";

const SelectInput = ({
  title,
  name,
  value,
  onChange,
  placeholder = "Select an option",
  options = [],
  required = false,
  disabled = false,
  errorText = "",
  helperText = "",
  mode,
  size = "large",
  allowClear = true,
  showSearch = false,
  optionFilterProp = "label",

  // NEW pass-throughs for remote search / UX
  onSearch,
  filterOption,
  loading = false,
  notFoundContent,
  onFocus,
  onPopupScroll,
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
        <Select
          className="select-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          options={options}
          allowClear={allowClear}
          mode={mode}
          showSearch={showSearch}
          optionFilterProp={optionFilterProp}
          popupMatchSelectWidth={false}
          // NEW
          onSearch={onSearch}
          filterOption={filterOption}
          loading={loading}
          notFoundContent={notFoundContent}
          onFocus={onFocus}
          onPopupScroll={onPopupScroll}
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

export default SelectInput;
