let bookings = [];

export default function handler(req, res) {

  if (req.method === "POST") {

    const { name, address, date } = req.body;

    if (!name || !address || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing booking information"
      });
    }

    const newBooking = {
      id: bookings.length + 1,
      name,
      address,
      date,
      status: "pending"
    };

    bookings.push(newBooking);

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      booking: newBooking
    });

  }

  else if (req.method === "GET") {

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      data: bookings
    });

  }

  else {
    res.status(405).json({
      message: "Method not allowed"
    });
  }

}
