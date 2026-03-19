import { useState } from "react";

// ─── Email Preview Template ───────────────────────────────────────────────────
function EmailPreview({ booking }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden text-slate-800 shadow-2xl">
      {/* Email chrome */}
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-xs text-slate-500 font-sans space-y-0.5">
        <div><span className="font-semibold text-slate-700">From:</span> noreply@plowpro.ca</div>
        <div><span className="font-semibold text-slate-700">To:</span> {booking.email}</div>
        <div><span className="font-semibold text-slate-700">Subject:</span> ✅ Booking Confirmed – {booking.id}</div>
      </div>
      {/* Email body */}
      <div className="p-6 font-sans">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">❄</div>
          <span className="text-slate-800 font-bold tracking-tight text-lg">PlowPro</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Your booking is confirmed!</h2>
        <p className="text-slate-500 text-sm mb-5">Hi {booking.ownerName}, here's a summary of your upcoming service.</p>

        {/* Booking Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5 space-y-3">
          <Row label="Booking ID" value={booking.id} highlight />
          <Row label="Property" value={booking.property} />
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time Slot" value={booking.timeSlot} />
          {booking.notes && <Row label="Notes" value={booking.notes} />}
        </div>

        <p className="text-sm text-slate-600 mb-4">
          You'll receive another notification when the crew is <strong>En Route</strong>, and again when the <strong>job is complete</strong>. No need to call — we'll keep you updated.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-5">
          💡 Need to cancel? You can cancel pending bookings from your dashboard up to 2 hours before the scheduled time.
        </div>

        <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          PlowPro · London, ON · <span className="underline cursor-pointer">Unsubscribe</span>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-right font-medium ${highlight ? "text-blue-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

// ─── Notification Trigger Demo ────────────────────────────────────────────────
const DEMO_BOOKING = {
  id: "BK-2041",
  ownerName: "Sarah",
  email: "sarah@email.com",
  property: "142 Elmwood Drive, London ON",
  service: "Plow & Salt",
  date: "March 19, 2026",
  timeSlot: "8:00 AM – 10:00 AM",
  notes: "Side gate locked — use front driveway.",
};

export default function ConfirmationNotification() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("preview"); // "preview" | "trigger"

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-1">Notifications</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Confirmation Email</h1>
          <p className="text-slate-400 text-sm mt-1">Automatically sent when a booking is approved</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6 w-fit">
          {["preview", "trigger"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs uppercase tracking-widest px-4 py-2 rounded-md transition-colors font-semibold
                ${tab === t ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              {t === "preview" ? "📧 Email Preview" : "⚡ Trigger Demo"}
            </button>
          ))}
        </div>

        {tab === "preview" && (
          <EmailPreview booking={DEMO_BOOKING} />
        )}

        {tab === "trigger" && (
          <div className="space-y-4">
            {/* Booking info card */}
            <div className="border border-slate-800 bg-slate-900 rounded-xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Booking to Confirm</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">ID</span><span className="text-cyan-400 font-semibold">{DEMO_BOOKING.id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="text-white">{DEMO_BOOKING.ownerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{DEMO_BOOKING.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Property</span><span className="text-white text-right max-w-xs">{DEMO_BOOKING.property}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="text-white">{DEMO_BOOKING.date}</span></div>
              </div>
            </div>

            {/* Send Button / Status */}
            {!sent ? (
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "📧 Send Confirmation Email"
                )}
              </button>
            ) : (
              <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-5 text-center">
                <p className="text-green-400 text-2xl mb-2">✅</p>
                <p className="text-green-400 font-bold">Email Sent!</p>
                <p className="text-slate-400 text-sm mt-1">Confirmation delivered to <span className="text-white">{DEMO_BOOKING.email}</span></p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Reset demo
                </button>
              </div>
            )}

            {/* Backend note */}
            <div className="border border-slate-800 rounded-xl p-4 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold mb-1">🔌 Backend Integration Note</p>
              This component calls <code className="bg-slate-800 px-1 rounded text-cyan-400">POST /api/notifications/confirm</code> with the booking ID.
              The server sends the email via <span className="text-slate-300">Nodemailer / SendGrid</span> using the owner's registered email address.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}