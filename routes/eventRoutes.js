
const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { getEventsCollection } = require("../config/db");
const verifyToken = require("../middleware/verifyToken");

// Get all upcoming events (Public)
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

// Create a new event (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      thumbnail,
      location,
      eventDate,
    } = req.body;

    // Verify authenticated user's email
    const creatorEmail = req.user.email;

    if (!creatorEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found",
      });
    }

    // Required field validation
    if (
      !title ||
      !description ||
      !eventType ||
      !thumbnail ||
      !location ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const parsedDate = new Date(eventDate);

    // Future date validation
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const newEvent = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      thumbnail,
      location: location.trim(),
      eventDate: parsedDate,
      creatorEmail: creatorEmail.toLowerCase().trim(),
      createdAt: new Date(),
    };

    const result = await getEventsCollection().insertOne(newEvent);

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      eventId: result.insertedId,
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
});

// Get a single event by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await getEventsCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
});

module.exports = router;
