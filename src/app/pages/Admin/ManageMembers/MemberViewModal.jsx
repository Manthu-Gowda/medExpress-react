import React from "react";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";
import CustomModal from "../../../components/CustomModal/CustomModal";
import "./MemberViewModal.scss";

// Dummy member + patients (replace with API payload)
const DUMMY_MEMBER = {
  id: 1,
  name: "Brahim elabbaoui",
  email: "brahimelabbaoui1124@gmail.com",
  address: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  avatar: "https://i.pravatar.cc/128?img=12",
  patientsCount: 6,
  patients: Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: "Brahim elabbaoui",
    phone: "+91 9876543210",
    email: "brahimelabbaoui1124@gmail.com",
    address: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
    visaType: "Business visa",
    expiry: "12 Sep, 2028",
    avatar: `https://i.pravatar.cc/96?img=${i + 20}`,
  })),
};

const MemberViewModal = ({ open, onClose, member = DUMMY_MEMBER }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Manage Members"
      showPrimary={false}
      showDanger={false}
      width={920}
      className="mv"
      bodyClassName="mv__body"
    >
      {/* Member header */}
      <section className="mv__section">
        <div className="mv__sectionHead">
          <h4 className="mv__sectionTitle">Member</h4>
          <div className="mv__sectionActions">
            <button type="button" className="mv__iconBtn mv__iconBtn--danger" title="Delete member">
              <DeleteFilled />
            </button>
          </div>
        </div>

        <div className="mv__memberCard">
          <img className="mv__memberAvatar" src={member.avatar} alt={member.name} />
          <div className="mv__memberMeta">
            <div className="mv__memberName">{member.name}</div>
            <div className="mv__muted">{member.email}</div>
            <div className="mv__muted">{member.address}</div>
          </div>
        </div>
      </section>

      {/* Patients */}
      <section className="mv__section">
        <div className="mv__sectionHead">
          <h4 className="mv__sectionTitle">
            Patients ({String(member.patientsCount).padStart(2, "0")})
          </h4>
        </div>

        <div className="mv__patientGrid">
          {member.patients.map((p) => (
            <article key={p.id} className="mv__patientCard">
              <header className="mv__patientHeader">
                <div className="mv__patientLeft">
                  <img className="mv__patientAvatar" src={p.avatar} alt={p.name} />
                  <div>
                    <div className="mv__patientName">{p.name}</div>
                    <div className="mv__phone">{p.phone}</div>
                    <div className="mv__muted">{p.email}</div>
                  </div>
                </div>
                <button type="button" className="mv__iconBtn" title="Edit">
                  <EditOutlined />
                </button>
              </header>

              <div className="mv__address">{p.address}</div>

              <div className="mv__kv">
                <div>
                  <span className="mv__muted">Visa :</span>
                  <span className="mv__strong">&nbsp;{p.visaType}</span>
                </div>
                <div>
                  <span className="mv__muted">Exp :</span>
                  <span className="mv__strong">&nbsp;{p.expiry}</span>
                </div>
              </div>

              <div className="mv__ctaRow">
                <button type="button" className="mv__btn mv__btn--ghost">View Passport</button>
                <button type="button" className="mv__btn mv__btn--primary">View Prescriptions</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </CustomModal>
  );
};

export default MemberViewModal;
