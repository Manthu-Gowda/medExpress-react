// src/components/SearchInput/SearchInput.jsx
import React, { useEffect, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

import "./SearchInput.scss";

const SearchInput = ({
  value,
  defaultValue = "",
  onChange, // fires immediately on every keystroke (optional)
  onDebouncedChange, // fires after debounce delay
  delay = 500,
  placeholder = "Search...",
  size = "large",
  disabled = false,
  allowClear = true,
  className = "",
}) => {
  const [innerValue, setInnerValue] = useState(value ?? defaultValue);

  // Sync with controlled value from parent
  useEffect(() => {
    if (value !== undefined) {
      setInnerValue(value);
    }
  }, [value]);

  // Debounce effect
  useEffect(() => {
    if (!onDebouncedChange) return;

    const handler = setTimeout(() => {
      onDebouncedChange(innerValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [innerValue, delay, onDebouncedChange]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInnerValue(newValue);

    if (onChange) {
      onChange(e);
    }
  };

  return (
    // <div className={`search-input ${className}`}>
      <Input
        value={innerValue}
        onChange={handleChange}
        placeholder={placeholder}
        size={size}
        disabled={disabled}
        allowClear={allowClear}
        prefix={<SearchOutlined />}
      />
    // </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onDebouncedChange: PropTypes.func,
  delay: PropTypes.number,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(["small", "middle", "large"]),
  disabled: PropTypes.bool,
  allowClear: PropTypes.bool,
  className: PropTypes.string,
};

export default SearchInput;
