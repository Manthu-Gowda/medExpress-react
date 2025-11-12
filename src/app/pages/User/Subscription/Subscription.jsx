import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Tag, Radio, Empty } from "antd"; // + Checkbox
import { CheckCircleFilled } from "@ant-design/icons";
import "./Subscription.scss";
import SubHeader from "../../../components/SubHeader/SubHeader";
import CustomModal from "../../../components/CustomModal/CustomModal";
import { getApi, postApi } from "../../../utils/apiService";
import {
  GET_SUBSCRIPTIONS,
  SUBSCRIPTION_PLANS,
  GET_ALL_UNSUBSCRIBED_PATIENTS,
  ADD_SUBSCRIPTIONS,
} from "../../../utils/apiPath"; // + patients & add sub
import Loader from "../../../components/Loader/Loader";
import { errorToast } from "../../../services/ToastHelper";

const currencyUSD = (n) => {
  if (n === undefined || n === null || n === "") return "";
  const num = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const joinParts = (...parts) =>
  parts
    .map((p) => (typeof p === "string" ? p.trim() : p))
    .filter((p) => p && String(p).length > 0)
    .join(", ");

const formatPatientAddress = (p = {}) => {
  // Handle common API key variants safely
  const a1 = p.address1 ?? p.addr1 ?? p.address ?? "";
  const a2 = p.address2 ?? p.addr2 ?? "";
  const city = p.cityName ?? p.city ?? "";
  const state = p.stateName ?? p.state ?? "";
  const country = p.countryName ?? p.country ?? "";
  const zip = p.zipCode ?? p.zip ?? "";

  const line = joinParts(a1, a2, city, state, country, zip);
  return line || "—";
};

const Subscription = () => {
  const [tab, setTab] = useState("active");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // <-- multi-select IDs
  const [plansData, setPlansData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);

  const [patients, setPatients] = useState([]); // <-- patients list
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);

  const columns = useMemo(
    () => [
      { title: "Sl No", dataIndex: "slno", key: "slno", width: 110 },
      {
        title: "Patient Name",
        dataIndex: "patient",
        key: "patient",
        render: (t) => <span className="text-ellipsis">{t}</span>,
      },
      { title: "Order Date", dataIndex: "date", key: "date", width: 220 },
    ],
    []
  );

  const mapRows = (arr = []) =>
    arr.map((item, idx) => ({
      key: item.id ?? `${idx}`,
      slno: String(idx + 1).padStart(2, "0"),
      patient: item.patientName ?? item.name ?? "—",
      date: item.createdDate
        ? new Date(item.createdDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })
        : "—",
    }));

  // fetch table rows when toggle changes
  useEffect(() => {
    let alive = true;
    (async () => {
      setTableLoading(true);
      setTableError(null);
      try {
        const payload = { isActive: tab === "active" };
        const { statusCode, data } = await postApi(GET_SUBSCRIPTIONS, payload);
        if (!alive) return;
        if (statusCode === 200 && Array.isArray(data)) {
          setTableRows(mapRows(data));
        } else {
          setTableRows([]);
          setTableError("Failed to load subscription rows");
        }
      } catch (e) {
        if (!alive) return;
        setTableRows([]);
        setTableError(e?.message || "Failed to load subscription rows");
      } finally {
        if (alive) setTableLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab]);

  // fetch plan banner
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { statusCode, data } = await getApi(SUBSCRIPTION_PLANS);
        if (statusCode === 200 && Array.isArray(data)) {
          setPlansData(data);
        } else {
          setPlansData([]);
          setError("Failed to load plans");
        }
      } catch (e) {
        setPlansData([]);
        setError(e?.message || "Failed to load plans");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const plan = useMemo(
    () => (Array.isArray(plansData) ? plansData[0] || null : plansData || null),
    [plansData]
  );

  // fetch patients (called when Subscribe is clicked)
  const fetchAllPatients = async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const payload = { pageIndex: 0, pageSize: 50, searchString: "" };
      const { statusCode, data } = await getApi(
        GET_ALL_UNSUBSCRIBED_PATIENTS,
        payload
      );
      if (statusCode === 200 && Array.isArray(data)) {
        setPatients(data);
      } else {
        setPatients([]);
        setPatientsError("Failed to load patients");
      }
    } catch (e) {
      setPatients([]);
      setPatientsError(e?.message || "Failed to load patients");
    } finally {
      setPatientsLoading(false);
    }
  };

  // open modal + fetch patients
  const onSubscribeClick = async () => {
    setSelectedId(null); // reset selection every time
    setOpen(true);
    await fetchAllPatients();
  };

  // toggle selection (card or checkbox)
  const toggleSelect = (id) => {
    setSelectedId((curr) => (curr === id ? null : id));
  };

  // submit AddSubscription
  const onPayNow = async () => {
    if (!plan?.id || !selectedId) return;

    try {
      setIsLoading(true);
      const payload = {
        patientIds: [selectedId],
        subscriptionPlanId: plan.id,
      };

      const { statusCode, data } = await postApi(ADD_SUBSCRIPTIONS, payload);

      if (statusCode === 200 && data?.checkoutUrl) {
        setOpen(false);
        window.location.href = data.checkoutUrl;
      } else {
        errorToast("Failed to create subscription or no payment link found");
      }
    } catch (e) {
      errorToast(e?.message || "Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscription">
      {isLoading && <Loader />}
      <SubHeader title="Orders" showBack={false} showRight={false} />

      <section className="subscription_sec">
        {/* Plan Banner */}
        <div className="planCard">
          <div className="planCard__left">
            <div className="planCard__badgeRow">
              <Tag className="planCard__badge">
                {plan?.isActive ? "Active" : "Inactive"}
              </Tag>
              <span className="planCard__planTitle">
                {plan?.name || (error ? "—" : "Loading…")}
              </span>
            </div>

            <ul className="planCard__features">
              <li>
                <CheckCircleFilled />
                <span>{plan?.description || "—"}</span>
              </li>
            </ul>
          </div>

          <div className="planCard__right">
            <div className="planCard__price">
              {plan ? currencyUSD(plan.amount) : "—"}
            </div>
            <Button
              type="primary"
              size="large"
              className="planCard__cta"
              onClick={onSubscribeClick} // <-- fetch patients + open modal
              disabled={!plan?.id}
            >
              Place Order
            </Button>
          </div>
        </div>

        {/* Toggle */}
        <div className="subToggle">
          <button
            className={`subToggle__btn ${tab === "active" ? "is-active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active Orders
          </button>
          <button
            className={`subToggle__btn ${
              tab === "previous" ? "is-active" : ""
            }`}
            onClick={() => setTab("previous")}
          >
            Previous Orders
          </button>
        </div>

        {/* Table */}
        <div className="subTableWrap">
          <Table
            rowKey="key"
            columns={columns}
            dataSource={tableRows}
            pagination={false}
            className="subTable"
            loading={tableLoading}
          />
          {tableError && (
            <div
              className="tableError"
              style={{ marginTop: 8, color: "#d4380d" }}
            >
              {tableError}
            </div>
          )}
        </div>
      </section>

      {/* Modal with multi-select */}
      <CustomModal
        open={open}
        title="Orders"
        onClose={() => setOpen(false)}
        primaryText="Pay Now"
        dangerText="Cancel"
        onPrimary={onPayNow} // <-- call AddSubscription
        onDanger={() => setOpen(false)}
        primaryProps={{
          disabled: selectedId == null || patients.length === 0,
        }}
      >
        <p style={{ marginBottom: 12, color: "#012047", fontWeight: 600 }}>
          Select a Patient for Order
        </p>

        {patientsLoading && <div style={{ padding: 8 }}>Loading patients…</div>}
        {patientsError && (
          <div style={{ padding: 8, color: "#d4380d" }}>{patientsError}</div>
        )}
        {!patientsLoading && !patientsError && patients.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No patients available"
            style={{ padding: 16 }}
          />
        ) : (
          <div className="patientsGrid">
            {patients.map((p) => {
              const id = p.id || p.patientId || p._id;
              const name = p.name || p.fullName || p.patientName || "—";
              const address = formatPatientAddress(p);
              const checked = selectedId === id;

              return (
                <div
                  key={id}
                  className={`patientItem ${checked ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setSelectedId(id)
                  }
                >
                  <div className="patientItem__text">
                    <strong>{name}</strong>
                    <small>Address : {address}</small>
                  </div>

                  <Radio
                    checked={checked}
                    onChange={() => setSelectedId(id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default Subscription;
