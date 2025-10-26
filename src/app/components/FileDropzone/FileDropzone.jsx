import React, { useRef, useState, forwardRef } from "react";
import "./FileDropzone.scss";

const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
};

/**
 * Reusable file upload with drag & drop
 */
const FileDropzone = forwardRef(
  (
    {
      title,
      required = false,
      accept, // e.g. ".pdf,.png,.jpg" or "image/*"
      multiple = false,
      maxSizeMB, // number | undefined
      disabled = false,
      helperText = "",
      errorText = "",
      value = [], // Array<File>; controlled selected files (optional)
      onChange, // (files: File[]) => void
      placeholder = "Drag or drop your file here",
      name = "file-upload",
      folderIcon = null, // optional custom icon node
      height = 160, // px height of the drop area
    },
    ref
  ) => {
    const inputRef = ref || useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [internalFiles, setInternalFiles] = useState([]);
    const files = value && value.length ? value : internalFiles;
    const hasError = Boolean(errorText);

    const chooseFiles = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    const emit = (fileList) => {
      const picked = Array.from(fileList || []);
      let filtered = picked;

      // basic size filter (optional)
      if (maxSizeMB) {
        const cap = maxSizeMB * 1024 * 1024;
        filtered = picked.filter((f) => f.size <= cap);
      }

      if (!value) setInternalFiles(filtered);
      onChange?.(filtered);
    };

    const onInputChange = (e) => emit(e.target.files);

    const onDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      emit(e.dataTransfer.files);
    };

    const onDrag = (e, active) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setDragActive(active);
    };

    const clearOne = (idx) => {
      const next = files.filter((_, i) => i !== idx);
      if (!value) setInternalFiles(next);
      onChange?.(next);
    };

    return (
      <div className={`forminput ${hasError ? "has-error" : ""}`}>
        {title && (
          <span className="input-label">
            {title}
            {required && <span className="required-asterisk"> *</span>}
          </span>
        )}
        {!files.length && (
          <div
            className={`filedropzone ${dragActive ? "is-drag" : ""} ${
              disabled ? "is-disabled" : ""
            }`}
            style={{ height }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label={placeholder}
            onClick={chooseFiles}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                chooseFiles();
              }
            }}
            onDragEnter={(e) => onDrag(e, true)}
            onDragOver={(e) => onDrag(e, true)}
            onDragLeave={(e) => onDrag(e, false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              onChange={onInputChange}
              style={{ display: "none" }}
            />

            <div className="dz-inner">
              {folderIcon ?? (
                <svg
                  className="dz-icon"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M10 4l2 2h7a1 1 0 011 1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4z"
                    opacity="0.35"
                  />
                  <path
                    fill="currentColor"
                    d="M4 8h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                  />
                </svg>
              )}
              <p className="dz-text">{placeholder}</p>
              {accept && <p className="dz-subtext">Allowed: {accept}</p>}
              {maxSizeMB && (
                <p className="dz-subtext">Max size: {maxSizeMB} MB</p>
              )}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <ul className="dz-files">
            {files.map((f, i) => (
              <li key={i} className="dz-file">
                <span className="dz-file-name" title={f.name}>
                  {f.name}
                </span>
                <span className="dz-file-size">{formatSize(f.size)}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="dz-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearOne(i);
                    }}
                    aria-label={`Remove ${f.name}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {hasError ? (
          <span className="input-error-text">{errorText}</span>
        ) : (
          helperText && <span className="input-helper-text">{helperText}</span>
        )}
      </div>
    );
  }
);

export default FileDropzone;
