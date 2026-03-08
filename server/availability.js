export default function handler(req, res) {
  const availability = [
    { date: "2026-03-10", available: true },
    { date: "2026-03-11", available: false },
    { date: "2026-03-12", available: true }
  ];

  res.status(200).json(availability);
}
