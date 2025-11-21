import React from "react";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import "./CustomModal.scss";

// NOTE: This expects you already have ButtonComponent with props: variant, onClick, loading, disabled, etc.
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const CustomModal = ({
  open,
  title = "",
  children,
  onClose,                // closes the modal (X button & mask)
  // Footer buttons
  showPrimary = true,
  showDanger = true,
  primaryText = "Pay Now",
  dangerText = "Cancel",
  onPrimary,              // click handler for primary
  onDanger,               // click handler for danger (defaults to onClose)
  primaryProps = {},      // pass loading/disabled/etc
  dangerProps = {},
  // Layout & behavior
  width = 760,
  centered = true,
  maskClosable = false,
  destroyOnHidden = true,
  footerAlign = "right",  // "left" | "center" | "right"
  className = "",
  bodyClassName = "",
  closable = true,
  
}) => {
  const handleDanger = onDanger || onClose;

  return (
    <Modal
      open={open}
      width={width}
      centered={centered}
      maskClosable={maskClosable}
      destroyOnHidden={destroyOnHidden}
      footer={null}           
      closable={false}          
      onCancel={onClose}
      className={`appModal ${className}`}
    >
      <div className="appModal__header">
        <h3 className="appModal__title">{title}</h3>
        {closable && (
          <button
            type="button"
            className="appModal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        )}
      </div>

      <div className={`appModal__body ${bodyClassName}`}>{children}</div>

      {(showPrimary || showDanger) && (
        <div className={`appModal__footer is-${footerAlign}`}>
          {showDanger && (
            <ButtonComponent
              variant="danger"
              onClick={handleDanger}
              {...dangerProps}
            >
              {dangerText}
            </ButtonComponent>
          )}
          {showPrimary && (
            <ButtonComponent
              variant="primary"
              onClick={onPrimary}
              {...primaryProps}
            >
              {primaryText}
            </ButtonComponent>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CustomModal;
