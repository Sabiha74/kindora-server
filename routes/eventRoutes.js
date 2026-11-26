
const express = require("express");
const router = express.Router();

const { getEventsCollection } = require("../config/db");

// Get all upcoming events
router.get("/", async (req, res) => {
  try {
    const events = await getEventsCollection()
      .find({ eventDate: { $gt: new Date() } })
      .sort({ eventDate: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
    });
  }
});

module.exports = router;
