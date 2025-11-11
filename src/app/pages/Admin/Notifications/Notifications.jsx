import React, { useMemo, useState } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./Notifications.scss";

const mockText =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,";

const Notifications = () => {
  const [isLoading] = useState(false);

  // MOCK DATA — replace with API response
  const initial = useMemo(
    () => [
      {
        id: 1,
        name: "Brahim elabbaoui",
        role: "Member",
        avatar: "https://i.pravatar.cc/96?img=12",
        body: mockText,
        timeAgo: "3 hours ago",
        unread: true,
      },
      {
        id: 2,
        name: "Brahim elabbaoui",
        role: "Shipper",
        avatar: "https://i.pravatar.cc/96?img=25",
        body: mockText,
        timeAgo: "3 hours ago",
        unread: true,
      },
      {
        id: 3,
        name: "Brahim elabbaoui",
        role: "Member",
        avatar: "https://i.pravatar.cc/96?img=31",
        body: mockText,
        timeAgo: "6 hours ago",
        unread: false,
      },
      {
        id: 4,
        name: "Brahim elabbaoui",
        role: "Shipper",
        avatar: "https://i.pravatar.cc/96?img=15",
        body: mockText,
        timeAgo: "8 hours ago",
        unread: false,
      },
    ],
    []
  );

  const [items, setItems] = useState(initial);

  const markAllRead = () =>
    setItems((lst) => lst.map((it) => ({ ...it, unread: false })));

  const toggleRead = (id) =>
    setItems((lst) =>
      lst.map((it) => (it.id === id ? { ...it, unread: !it.unread } : it))
    );

  return (
    <div className="notification">
      {isLoading && <Loader />}

      <SubHeader
        title="Notifications"
        showBack={false}
        showRight={true}
        buttonText="Mark as read"
        onClick={markAllRead}
      />

      <section className="notification__panel">
        {items.map((n, idx) => (
          <article
            key={n.id}
            className={`notifRow ${n.unread ? "is-unread" : ""}`}
            onClick={() => toggleRead(n.id)}
            role="button"
            tabIndex={0}
          >
            <img className="notifRow__avatar" src={n.avatar} alt={n.name} />

            <div className="notifRow__content">
              <div className="notifRow__title">
                <span className="notifRow__name">{n.name}</span>
                <span
                  className={`notifRow__badge ${
                    n.role === "Shipper" ? "is-shipper" : "is-member"
                  }`}
                >
                  {n.role}
                </span>
              </div>

              <p className="notifRow__body">{n.body}</p>
            </div>

            <div className="notifRow__meta">
              {n.unread && <span className="notifRow__dot" />}
              <span className="notifRow__time">{n.timeAgo}</span>
            </div>

            {idx !== items.length - 1 && <div className="notifRow__divider" />}
          </article>
        ))}
      </section>
    </div>
  );
};

export default Notifications;
