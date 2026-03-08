export default function handler(req, res) {

  const availability = [
    {
      date: "2026-03-10",
      crew: "Crew A",
      available: true
    },
    {
      date: "2026-03-11",
      crew: "Crew B",
      available: false
    },
    {
      date: "2026-03-12",
      crew: "Crew A",
      available: true
    }
  ];

  res.status(200).json({
    success: true,
    totalSlots: availability.length,
    data: availability
  });

}
