import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Modal, Image } from "antd";
import "./PatientCard.scss";
import EditIcon from "../../assets/icons/EditIcon";
import EyeIcon from "../../assets/icons/EyeIcon";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const extractUrl = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "object") {
    // support { url }, { href }, or any object that has a url-like field
    if (typeof item.url === "string") return item.url.trim();
    if (typeof item.href === "string") return item.href.trim();
  }
  return "";
};

const toUrlArray = (value) => {
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  return arr.map(extractUrl).filter(Boolean);
};

const Row = ({ label, value }) => (
  <div className="pc__row">
    <span className="pc__label">{label}</span>
    <span className="pc__value">{value || "-"}</span>
  </div>
);

const joinAddress = (...parts) =>
  parts
    .map((p) => (typeof p === "string" ? p.trim() : p))
    .filter((p) => p && p.length > 0)
    .join(", ");

/** ---- helpers ---- */
const getExt = (url = "") => {
  try {
    const u = String(url).split("?")[0].split("#")[0]; // drop query/hash
    return (u.substring(u.lastIndexOf(".") + 1) || "").toLowerCase();
  } catch {
    return "";
  }
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (String(url).startsWith("data:image/")) return true; // data-URL
  const ext = getExt(url);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
};

const isPdfUrl = (url) => {
  if (!url) return false;
  if (String(url).startsWith("data:application/pdf")) return true; // data-URL
  return getExt(url) === "pdf";
};

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const stop = (fn) => (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (e?.stopPropagation) e.stopPropagation();
  fn?.();
};

/** ---- component ---- */
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
    name,
    phoneNumber,
    email,
    dateOfBirth,
    visaTypeName,
    visaExpiryDate,
    usaLastEntryDate,
    address1,
    address2,
    cityName,
    stateName,
    countryName,

    // links (string | string[])
    passport,
    visa,
    prescriptions,
  } = data || {};

  const addressLine = joinAddress(
    address1,
    address2,
    cityName,
    stateName,
    countryName
  );

  // Modal state
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgList, setImgList] = useState([]); // array of image URLs
  const [imgStartIndex, setImgStartIndex] = useState(0);
  const [pdfList, setPdfList] = useState([]);

  const openNewTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

  // Build a preview for images (and collect pdfs optionally)
  const openPreview = (images = [], pdfs = []) => {
    if (images.length) {
      setImgList(images);
      setPdfList(pdfs);
      setImgStartIndex(0);
      setImgModalOpen(true);
    } else if (pdfs.length) {
      // If only PDFs, open each in new tab. You can change to just open the first.
      pdfs.forEach((p) => openNewTab(p));
    }
  };

  // Default handlers (used only if no onVisa/onPassport/onPrescriptions provided)
  const handleOpenPassport = () => {
    if (onPassport) return onPassport(data);

    const items = toUrlArray(passport);
    const images = items.filter(isImageUrl);
    const pdfs = items.filter(isPdfUrl);
    const others = items.filter((u) => !isImageUrl(u) && !isPdfUrl(u));

    if (images.length) openPreview(images, pdfs);
    else if (pdfs.length) pdfs.forEach((p) => openNewTab(p));
    else if (others.length) others.forEach((o) => openNewTab(o));
  };

  const handleOpenVisa = () => {
    if (onVisa) return onVisa(data);

    const items = toUrlArray(visa);
    const images = items.filter(isImageUrl);
    const pdfs = items.filter(isPdfUrl);
    const others = items.filter((u) => !isImageUrl(u) && !isPdfUrl(u));

    if (images.length) openPreview(images, pdfs);
    else if (pdfs.length) pdfs.forEach((p) => openNewTab(p));
    else if (others.length) others.forEach((o) => openNewTab(o));
  };

  const handleOpenPrescriptions = () => {
    if (onPrescriptions) return onPrescriptions(data);

    const items = toUrlArray(prescriptions);
    const images = items.filter(isImageUrl);
    const pdfs = items.filter(isPdfUrl);
    const others = items.filter((u) => !isImageUrl(u) && !isPdfUrl(u));

    if (images.length) openPreview(images, pdfs);
    if (pdfs.length && !images.length) pdfs.forEach((p) => openNewTab(p));
    if (others.length && !images.length) others.forEach((o) => openNewTab(o));
  };

  return (
    <>
      <article
        className={["pc", isSelected ? "pc--selected" : "", className]
          .join(" ")
          .trim()}
      >
        <header className="pc__header">
          <h3 className="pc__title">{name}</h3>
          <button
            type="button"
            className="pc__edit"
            aria-label={`Edit ${name}`}
            onClick={onEdit}
          >
            <EditIcon />
          </button>
        </header>

        <div className="pc__body">
          <Row label="Ph No:" value={phoneNumber} />
          <Row label="E Mail:" value={email} />
          <Row label="DOB:" value={dateOfBirth} />
          <Row label="Visa Type:" value={visaTypeName} />
          <Row label="Visa Exp Date:" value={visaExpiryDate} />
          <Row label="USA Last Entry Date:" value={usaLastEntryDate} />
          <Row label="Location:" value={addressLine} />
        </div>

        <footer className="pc__footer">
          <ButtonComponent variant="secondary" onClick={stop(handleOpenVisa)}>
            <EyeIcon /> <span>Visa</span>
          </ButtonComponent>

          <ButtonComponent
            variant="secondary"
            onClick={stop(handleOpenPassport)}
          >
            <EyeIcon /> <span>Passport</span>
          </ButtonComponent>

          <ButtonComponent onClick={stop(handleOpenPrescriptions)}>
            <EyeIcon fillColor="#FFFFFF" /> <span>Prescriptions</span>
          </ButtonComponent>
        </footer>
      </article>

      {/* Image Lightbox + optional PDFs list */}
      <Modal
        open={imgModalOpen}
        onCancel={() => setImgModalOpen(false)}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        title="Document Preview"
      >
        {imgList.length > 0 && (
          <Image.PreviewGroup
            preview={{
              visible: true,
              current: imgStartIndex,
              onVisibleChange: (vis) => !vis && setImgModalOpen(false),
            }}
          >
            {/* Render thumbnails (click to open preview group) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              {imgList.map((src, idx) => (
                <Image
                  key={src + idx}
                  src={src}
                  alt={`doc-${idx + 1}`}
                  height={140}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                  onClick={() => setImgStartIndex(idx)}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        )}

        {pdfList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>PDF files</div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {pdfList.map((p, i) => (
                <li key={p + i} style={{ marginBottom: 6 }}>
                  <a
                    href={p}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(p, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Open PDF {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  );
};

PatientCard.propTypes = {
  data: PropTypes.object,
  onEdit: PropTypes.func,
  onVisa: PropTypes.func,
  onPassport: PropTypes.func,
  onPrescriptions: PropTypes.func,
  isSelected: PropTypes.bool,
  className: PropTypes.string,
};

export default PatientCard;
