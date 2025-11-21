import React, { useState } from "react";
import dayjs from "dayjs";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";
import CustomModal from "../../../components/CustomModal/CustomModal";
import "./UserViewModal.scss";
import SampleUser from "../../../assets/SampleUser.jpg";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import { Popover } from "antd";

const formatAddress = (obj = {}) => {
  const { address1, address2, cityName, stateName, countryName, zipCode } = obj;
  return [address1, address2, cityName, stateName, countryName, zipCode]
    .filter(Boolean)
    .join(", ");
};

const formatDate = (value) => {
  if (!value) return "-";
  return dayjs(value).format("DD MMM, YYYY");
};

const UserViewModal = ({ open, onClose, member }) => {
  const [prescPopoverOpenId, setPrescPopoverOpenId] = useState(null);
  const hasMember = !!member;

  const memberAddress = hasMember ? formatAddress(member) : "";
  const patients = hasMember ? member.patients || [] : [];
  const patientsCount =
    hasMember && typeof member.totalPatients === "number"
      ? member.totalPatients
      : patients.length;

  // ✅ Use SampleUser if no profilePicture
  const avatar =
    hasMember && member.profilePicture ? member.profilePicture : SampleUser;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="User Patients"
      showPrimary={false}
      showDanger={false}
      width={920}
      className="mv"
      bodyClassName="mv__body"
    >
      {!hasMember ? (
        <div className="mv__empty">No member selected.</div>
      ) : (
        <>
          {/* Member header */}
          <section className="mv__section">
            <div className="mv__memberCard">
              <img
                className="mv__memberAvatar"
                src={avatar}
                alt={member.userName}
              />
              <div className="mv__memberMeta">
                <div className="mv__memberName">{member.userName}</div>
                <div className="mv__muted">{member.email}</div>
                <div className="mv__muted">{memberAddress}</div>
              </div>
              {/* <div className="mv__sectionActions">
                <button
                  type="button"
                  className="mv__iconBtn mv__iconBtn--danger"
                  title="Delete member"
                >
                  <DeleteFilled />
                </button>
              </div> */}
            </div>
          </section>

          {/* Patients */}
          <section className="mv__section">
            <div className="mv__sectionHead">
              <h4 className="mv__sectionTitle">
                Patients ({String(patientsCount).padStart(2, "0")})
              </h4>
            </div>

            {patients.length === 0 ? (
              <div className="mv__empty">
                Patients not available for this member.
              </div>
            ) : (
              <div className="mv__patientGrid">
                {patients.map((p) => {
                  const patientAddress = formatAddress(p);
                  const phone = [p.countryCode, p.phoneNumber]
                    .filter(Boolean)
                    .join(" ");

                  const patientAvatar = SampleUser;
                  const prescriptions = p.prescriptions || [];
                  const hasPresc = prescriptions.length > 0;
                  const multiplePresc = prescriptions.length > 1;
                  const firstPrescUrl = hasPresc ? prescriptions[0].url : null;
                  const prescPopoverContent = (
                    <div className="mv__prescList">
                      {prescriptions.map((doc, idx) => (
                        <button
                          key={doc.url || idx}
                          type="button"
                          className="mv__prescItem"
                          onClick={() => {
                            if (doc.url) {
                              window.open(doc.url, "_blank");
                              setPrescPopoverOpenId(null);
                            }
                          }}
                        >
                          {doc.fileName || `Prescription ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  );
                  return (
                    <article key={p.id} className="mv__patientCard">
                      <header className="mv__patientHeader">
                        <div className="mv__patientLeft">
                          <img
                            className="mv__patientAvatar"
                            src={patientAvatar}
                            alt={p.name}
                          />
                          <div>
                            <div className="mv__patientName">{p.name}</div>
                            <div className="mv__phone">{phone}</div>
                            <div className="mv__muted">{p.email}</div>
                          </div>
                        </div>
                        {/* <button
                          type="button"
                          className="mv__iconBtn"
                          title="Edit"
                        >
                          <EditOutlined />
                        </button> */}
                      </header>

                      <div className="mv__address">{patientAddress}</div>

                      <div className="mv__kv">
                        <div>
                          <span className="mv__muted">Visa :</span>
                          <span className="mv__strong">
                            &nbsp;{p.visaTypeName || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="mv__muted">Exp :</span>
                          <span className="mv__strong">
                            &nbsp;{formatDate(p.visaExpiryDate)}
                          </span>
                        </div>
                      </div>

                      <div className="mv__ctaRow">
                        <ButtonComponent
                          variant="secondary2"
                          disabled={!p.passport?.url}
                          onClick={() => {
                            if (p.passport?.url) {
                              window.open(p.passport.url, "_blank");
                            }
                          }}
                        >
                          View Passport
                        </ButtonComponent>
                        {!hasPresc ? (
                          // No prescriptions at all
                          <ButtonComponent disabled>
                            View Prescriptions
                          </ButtonComponent>
                        ) : multiplePresc ? (
                          // Multiple prescriptions -> show Popover with fileNames
                          <Popover
                            trigger="click"
                            placement="top"
                            open={prescPopoverOpenId === p.id}
                            onOpenChange={(v) =>
                              setPrescPopoverOpenId(v ? p.id : null)
                            }
                            content={prescPopoverContent}
                            destroyTooltipOnHide
                          >
                            <ButtonComponent>
                              View Prescriptions
                            </ButtonComponent>
                          </Popover>
                        ) : (
                          // Single prescription -> just open directly
                          <ButtonComponent
                            onClick={() => {
                              if (firstPrescUrl) {
                                window.open(firstPrescUrl, "_blank");
                              }
                            }}
                          >
                            View Prescriptions
                          </ButtonComponent>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </CustomModal>
  );
};

export default UserViewModal;
