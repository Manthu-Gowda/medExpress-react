import React from "react";
import PropTypes from "prop-types";
import "./PatientCard.scss";
import EditIcon from "../../assets/icons/EditIcon";
import EyeIcon from "../../assets/icons/EyeIcon";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const Row = ({ label, value }) => (
  <div className="pc__row">
    <span className="pc__label">{label}</span>
    <span className="pc__value">{value || "-"}</span>
  </div>
);

const PatientCard = ({
  data,
  onEdit,
  onVisa,
  onPassport,
  onPrescriptions,
  isSelected = false,
  className = "",
}) => {
  const {
    fullName,
    phone,
    email,
    dob,
    visaType,
    visaExpDate,
    usaLastEntryDate,
    addressLine,
  } = data || {};

  return (
    <article
      className={["pc", isSelected ? "pc--selected" : "", className]
        .join(" ")
        .trim()}
    >
      <header className="pc__header">
        <h3 className="pc__title">{fullName}</h3>
        <button
          type="button"
          className="pc__edit"
          aria-label={`Edit ${fullName}`}
          onClick={onEdit}
        >
          <EditIcon />
        </button>
      </header>

      <div className="pc__body">
        <Row label="Ph No:" value={phone} />
        <Row label="E Mail:" value={email} />
        <Row label="DOB:" value={dob} />
        <Row label="Visa Type:" value={visaType} />
        <Row label="Visa Exp Date:" value={visaExpDate} />
        <Row label="USA Last Entry Date:" value={usaLastEntryDate} />
        <Row label="Location:" value={addressLine} />
      </div>

      <footer className="pc__footer">
        <ButtonComponent variant="secondary" onClick={onVisa}>
          <EyeIcon /> <span>Visa</span>
        </ButtonComponent>
        <ButtonComponent variant="secondary" onClick={onPassport}>
          <EyeIcon /> <span>Passport</span>
        </ButtonComponent>
        <ButtonComponent onClick={onPrescriptions}>
          <EyeIcon fillColor="#FFFFFF" /> <span>Prescriptions</span>
        </ButtonComponent>
      </footer>
    </article>
  );
};

PatientCard.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullName: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    dob: PropTypes.string,
    visaType: PropTypes.string,
    visaExpDate: PropTypes.string,
    usaLastEntryDate: PropTypes.string,
    addressLine: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onVisa: PropTypes.func,
  onPassport: PropTypes.func,
  onPrescriptions: PropTypes.func,
  isSelected: PropTypes.bool,
  className: PropTypes.string,
};

export default PatientCard;
