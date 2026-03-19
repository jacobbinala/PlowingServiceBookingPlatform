import { useState } from "react";

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
  const meta = STATUS_META[status] || STATUS_META["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {status}
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
  const [expanded, setExpanded] = useState("BK-2041");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-1">Booking Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Request Status</h1>
          <p className="text-slate-400 text-sm mt-1">Track your active and past service requests</p>
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {mockBookings.map((booking) => {
            const isOpen = expanded === booking.id;
            const meta = STATUS_META[booking.status];
            return (
              <div
                key={booking.id}
                className={`border rounded-xl overflow-hidden transition-all ${isOpen ? "border-cyan-500/40 bg-slate-900" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"}`}
              >
                {/* Card Header */}
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpanded(isOpen ? null : booking.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-slate-500 tracking-widest">{booking.id}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-white font-semibold truncate">{booking.property}</p>
                      <p className="text-slate-400 text-sm">{booking.service} · {booking.date}</p>
                    </div>
                    <span className="text-slate-500 text-lg">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Expanded Detail */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-800 pt-4">
                    {/* Progress */}
                    <ProgressBar timeline={booking.timeline} currentStatus={booking.status} />
                    {booking.status === "Cancelled" && (
                      <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                        <span>✕</span> <span>This booking was cancelled.</span>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-slate-800/60 rounded-lg p-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time Slot</p>
                        <p className="text-white text-sm font-medium">{booking.timeSlot}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Service</p>
                        <p className="text-white text-sm font-medium">{booking.service}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 bg-slate-800/60 rounded-lg p-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-slate-300 text-sm italic">{booking.notes}</p>
                      </div>
                    )}

                    {/* Timeline Log */}
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Activity Log</p>
                      <div className="space-y-2">
                        {booking.timeline.map((entry, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_META[entry.status]?.dot || "bg-slate-600"}`} />
                            <span className="text-slate-300">{entry.status}</span>
                            <span className="text-slate-600 text-xs ml-auto">{entry.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}