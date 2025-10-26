import React from "react";
import PropTypes from "prop-types";
import "./PatientsGrid.scss";
import PatientCard from "../PatientCard/PatientCard";

const PatientsGrid = ({
  items = [],
  selectedId,
  onEdit,
  onVisa,
  onPassport,
  onPrescriptions,
  onSelect, // optional: click card to select
}) => {
  return (
    <div className="patients-grid">
      {items.map((p) => (
        <div
          key={p.id}
          className="patients-grid__item"
          onClick={() => onSelect?.(p)}
          role={onSelect ? "button" : undefined}
        >
          <PatientCard
            data={p}
            isSelected={selectedId === p.id}
            onEdit={() => onEdit?.(p)}
            onVisa={onVisa ? () => onVisa(p) : undefined}
            onPassport={onPassport ? () => onPassport(p) : undefined}
            onPrescriptions={
              onPrescriptions ? () => onPrescriptions(p) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
};

PatientsGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEdit: PropTypes.func,
  onVisa: PropTypes.func,
  onPassport: PropTypes.func,
  onPrescriptions: PropTypes.func,
  onSelect: PropTypes.func,
};

export default PatientsGrid;
