import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PatientDetails.scss";

import Loader from "../../../components/Loader/Loader";
import { getApi, postApi } from "../../../utils/apiService";
import {
  GET_SHIPPER_PATIENT_BY_ID,
  UPLOAD_PATIENT_INVOICE,
} from "../../../utils/apiPath";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import EyeIcon from "../../../assets/icons/EyeIcon";
import { successToast, errorToast } from "../../../services/ToastHelper";
import DownloadIcon from "../../../assets/DownloadIcon";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import SubHeader from "../../../components/SubHeader/SubHeader";

const PLACEHOLDER_AVATAR =
  "https://ui-avatars.com/api/?background=0e82fd&color=fff&name=P";

const getFileType = (fileName = "") => {
  const parts = fileName.split(".");
  if (parts.length < 2) return "FILE";
  return parts.pop().toUpperCase();
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);

  const [data, setData] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const fileInputRef = useRef(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { statusCode, data } = await getApi(GET_SHIPPER_PATIENT_BY_ID, {
        params: { id },
      });
      if (statusCode === 200 && data) {
        setData(data);
      }
    } catch (err) {
      console.error("Fetch patient details failed", err);
      errorToast("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUploadClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInvoiceFile(file);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSaveInvoice = async () => {
    if (!invoiceFile || !id) return;
    try {
      setSavingInvoice(true);
      const base64 = await fileToBase64(invoiceFile);

      const payload = {
        patientId: id,
        fileName: invoiceFile.name,
        fileContent: base64,
      };

      const { statusCode, message } = await postApi(
        UPLOAD_PATIENT_INVOICE,
        payload
      );

      if (statusCode === 200) {
        successToast("Invoice uploaded successfully");
        setInvoiceFile(null);
        fetchDetails(); // refresh docs list if backend returns invoice as a document
      } else {
        errorToast(message || "Failed to upload invoice");
      }
    } catch (err) {
      console.error("Invoice upload failed", err);
      errorToast("Invoice upload failed");
    } finally {
      setSavingInvoice(false);
    }
  };

  const buildDocs = () => {
    if (!Array.isArray(data?.prescriptions)) return [];

    return data.prescriptions
      .filter((p) => p?.url)
      .map((p, i) => ({
        key: `presc-${i}`,
        name: p.fileName || `Medical Prescription ${i + 1}`,
        type: getFileType(p.fileName || "PDF"),
        url: p.url,
      }));
  };
  const docs = buildDocs();

  const handleViewDoc = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDoc = (url, fileName = "document") => {
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fullAddress = data
    ? [
        data.address1,
        data.address2,
        data.cityName,
        data.stateName,
        data.countryName,
        data.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const handleBack = () => {
    navigate("/medical-shipments");
  };

  return (
    <div className="pd">
      {(loading || savingInvoice) && <Loader />}
      <SubHeader
        title="Patient Details"
        showBack={true}
        onBack={handleBack}
        onClick={() => window.history.back()}
        showRight={false}
      />

      {data && (
        <section className="pd__hero">
          <div className="pd__heroLeft">
            <div className="pd__avatar">
              <img
                src={data.avatar || PLACEHOLDER_AVATAR}
                alt={data.name || "Patient"}
              />
            </div>
            <div className="pd__info">
              <h3 className="pd__name">{data.name}</h3>
              <p className="pd__email">{data.email}</p>
              <p className="pd__address">{fullAddress}</p>
            </div>
          </div>

          <div className="pd__heroRight">
            <div className="pd__upload">
              {invoiceFile ? (
                <div className="pd__uploadActions">
                  <ButtonComponent
                    onClick={handleSaveInvoice}
                    disabled={savingInvoice}
                  >
                    {savingInvoice ? "Uploading..." : "Upload Invoice"}
                  </ButtonComponent>
                  <ButtonComponent
                    variant="secondary"
                    onClick={() => setInvoiceFile(null)}
                    disabled={savingInvoice}
                  >
                    Cancel
                  </ButtonComponent>
                </div>
              ) : (
                <ButtonComponent onClick={handleUploadClick}>
                  Upload Invoice
                </ButtonComponent>
              )}
              <p className="pd__hint">
                <span>PDF, JPG, PNG allowed.</span>
                <span>Max size as per your backend.</span>
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </section>
      )}

      <hr className="pd__divider" />

      <section className="pd__docs">
        <h4 className="pd__docsTitle">Documents</h4>

        <div className="pd__docsCard">
          <div className="pd__docsHeader">
            <div className="pd__docsCol pd__docsCol--name">Document Name</div>
            <div className="pd__docsCol pd__docsCol--type">Document Type</div>
            <div className="pd__docsCol pd__docsCol--small">View</div>
            <div className="pd__docsCol pd__docsCol--small">Download</div>
          </div>

          {docs.length === 0 && (
            <div className="pd__docsEmpty">No documents available.</div>
          )}

          {docs.map((doc, index) => (
            <div
              key={doc.key}
              className={`pd__docsRow ${
                index !== docs.length - 1 ? "pd__docsRow--border" : ""
              }`}
            >
              <div className="pd__docsCol pd__docsCol--name">{doc.name}</div>
              <div className="pd__docsCol pd__docsCol--type">{doc.type}</div>

              <div className="pd__docsCol pd__docsCol--small">
                <button
                  type="button"
                  className="pd__iconBtn pd__iconBtn--view"
                  onClick={() => handleViewDoc(doc.url)}
                >
                  <EyeIcon />
                </button>
              </div>
              <div className="pd__docsCol pd__docsCol--small">
                <button
                  type="button"
                  className="pd__iconBtn"
                  onClick={() => handleDownloadDoc(doc.url, doc.name)}
                >
                  <DownloadIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PatientDetails;
