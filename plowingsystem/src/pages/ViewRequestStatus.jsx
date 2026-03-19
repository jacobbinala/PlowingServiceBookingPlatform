import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const STATUS_STEPS = ["Pending", "Approved", "En Route", "Completed"];

const STATUS_META = {
  Pending:   { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-500/30", dot: "bg-yellow-400", icon: "🕐" },
  Approved:  { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-500/30",   dot: "bg-blue-400",   icon: "✅" },
  "En Route":{ color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-500/30", dot: "bg-orange-400", icon: "🚚" },
  Completed: { color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-500/30",  dot: "bg-green-400",  icon: "🏁" },
  Cancelled: { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-500/30",    dot: "bg-red-400",    icon: "✕"  },
};

const mockBookings = [
  {
    id: "BK-2041",
    property: "142 Elmwood Drive, London ON",
    service: "Plow & Salt",
    date: "March 19, 2026",
    timeSlot: "8:00 AM – 10:00 AM",
    status: "En Route",
    notes: "Side gate locked — use front.",
    timeline: [
      { status: "Pending",   time: "Mar 18, 9:02 AM" },
      { status: "Approved",  time: "Mar 18, 10:15 AM" },
      { status: "En Route",  time: "Mar 19, 7:48 AM" },
    ],
  },
  {
    id: "BK-2038",
    property: "88 Ridgeway Ave, London ON",
    service: "Standard Plow",
    date: "March 15, 2026",
    timeSlot: "12:00 PM – 2:00 PM",
    status: "Completed",
    notes: "",
    timeline: [
      { status: "Pending",   time: "Mar 14, 3:00 PM" },
      { status: "Approved",  time: "Mar 14, 4:22 PM" },
      { status: "En Route",  time: "Mar 15, 11:51 AM" },
      { status: "Completed", time: "Mar 15, 1:10 PM" },
    ],
  },
  {
    id: "BK-2031",
    property: "142 Elmwood Drive, London ON",
    service: "Standard Plow",
    date: "March 10, 2026",
    timeSlot: "6:00 AM – 8:00 AM",
    status: "Cancelled",
    notes: "Snow melted overnight.",
    timeline: [
      { status: "Pending",   time: "Mar 9, 8:00 PM" },
      { status: "Cancelled", time: "Mar 9, 11:30 PM" },
    ],
  },
];

function StatusBadge({ status }) {
  // Backend status values are lowercase snake_case; UI needs title-cased labels.
  let meta = STATUS_META.Pending;
  let label = status;

  if (status === "pending") {
    meta = STATUS_META.Pending;
    label = "Pending";
  } else if (status === "confirmed") {
    meta = STATUS_META.Approved; // reuse styles from Approved
    label = "Confirmed";
  } else if (status === "en_route") {
    meta = STATUS_META["En Route"];
    label = "En Route";
  } else if (status === "completed") {
    meta = STATUS_META.Completed;
    label = "Completed";
  } else if (status === "cancelled") {
    meta = STATUS_META.Cancelled;
    label = "Cancelled";
  } else if (STATUS_META[status]) {
    meta = STATUS_META[status];
    label = status;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {label}
    </span>
  );
}

function ProgressBar({ timeline, currentStatus }) {
  if (currentStatus === "Cancelled") return null;
  const currentStep = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const reached = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${active ? "border-cyan-400 bg-cyan-400 text-slate-950" :
                  reached ? "border-cyan-600 bg-cyan-600/20 text-cyan-400" :
                  "border-slate-700 bg-slate-800 text-slate-600"}`}>
                {reached ? (active ? "●" : "✓") : i + 1}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap ${active ? "text-cyan-400 font-semibold" : reached ? "text-slate-400" : "text-slate-600"}`}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? "bg-cyan-600" : "bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ViewRequestStatus() {
  const { token } = useAuth();
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bookings");
        if (!cancelled) setBookings(data.bookings || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load bookings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, API_BASE]);

  const statusMessage = useMemo(() => {
    if (!token) return "Log in to view your request status.";
    if (bookings.length === 0) return "No requests found.";
    return null;
  }, [token, bookings.length]);

  const notificationHint = (booking) => {
    const list = Array.isArray(booking.notifications) ? booking.notifications : [];
    const enRoute = list.find((n) => n.type === "en_route");
    const complete = list.find((n) => n.type === "job_complete");
    if (booking.status === "en_route" && enRoute) return `Arriving in ${enRoute.etaWindow || "15-30 mins"}`;
    if (booking.status === "completed" && complete)
      return `Job complete at ${complete.completionTime ? new Date(complete.completionTime).toLocaleString() : "—"}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-1">Booking Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Request Status</h1>
          <p className="text-slate-400 text-sm mt-1">Track your active and past service requests</p>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : statusMessage ? (
          <p className="text-slate-400">{statusMessage}</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isCancelled = booking.status === "cancelled";
              return (
                <div key={booking._id || booking.bookingRefId} className="border border-slate-800 bg-slate-900/50 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-slate-500 tracking-widest">{booking.bookingRefId || booking.id}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-white font-semibold truncate">
                        {booking.userId?.address
                          ? `${booking.userId.address.street || ""}${booking.userId.address.city ? ", " + booking.userId.address.city : ""}`
                          : "—"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {booking.serviceType} · {booking.date} · {booking.time}
                      </p>
                      {!isCancelled && notificationHint(booking) && (
                        <p className="mt-3 text-slate-200 text-sm">
                          <span className="font-semibold text-orange-200">
                            {booking.status === "en_route" ? "En Route:" : "Notification:"}
                          </span>{" "}
                          {notificationHint(booking)}
                        </p>
                      )}
                      {isCancelled && <p className="mt-3 text-red-300 text-sm">This booking was cancelled.</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
