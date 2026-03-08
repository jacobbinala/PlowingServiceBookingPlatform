export default function handler(req, res) {

  if (req.method === "POST") {
    
    const booking = {
      name: req.body.name,
      address: req.body.address,
      date: req.body.date,
      status: "pending"
    };

    res.status(200).json({
      message: "Booking request submitted successfully",
      booking: booking
    });

  } else {
    res.status(405).json({ message: "Method not allowed" });
  }

}
