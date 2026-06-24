const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { AppError } = require("../utils/errors");
const https = require("https");

exports.getComplaints = async (req, res, next) => {
  try {
    const filter = { isDeleted: false, "location.coordinates.0": { $ne: 0 } };

    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    } else if (req.user.role === "worker") {
      filter.assignedWorker = req.user.id;
    } else if (req.user.role === "dept_head") {
      const userDoc = await User.findById(req.user.id);
      if (!userDoc.department) return res.json([]);
      filter.department = userDoc.department;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.department) filter.department = req.query.department;

    const complaints = await Complaint.find(filter)
      .select("complaintId title status priority location address citizen assignedWorker department")
      .populate("citizen", "name")
      .populate("assignedWorker", "name")
      .populate("department", "name");

    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

exports.getNearby = async (req, res, next) => {
  try {
    const { lng, lat, radius } = req.query;
    if (!lng || !lat) {
      throw new AppError("lng and lat query params required", 400);
    }

    const maxDistance = (parseInt(radius) || 5000);

    let filter = {
      isDeleted: false,
      "location.coordinates.0": { $ne: 0 },
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance,
        },
      },
    };

    if (req.query.status) filter.status = req.query.status;

    const complaints = await Complaint.find(filter)
      .select("complaintId title status priority location address")
      .limit(100);

    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

exports.reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      throw new AppError("lat and lng query params required", 400);
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    https.get(url, { headers: { "User-Agent": "SmartSphereCity/2.0" } }, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        try {
          const result = JSON.parse(data);
          const addr = result.address || {};
          res.json({
            displayName: result.display_name || "",
            address: {
              road: addr.road || "",
              city: addr.city || addr.town || addr.village || addr.county || "",
              state: addr.state || "",
              postcode: addr.postcode || "",
              country: addr.country || "",
            },
          });
        } catch {
          res.json({ displayName: "", address: {} });
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      throw new AppError("Search query is required", 400);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;

    https.get(url, { headers: { "User-Agent": "SmartSphereCity/2.0" } }, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        try {
          const results = JSON.parse(data);
          res.json(results.map((r) => ({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            displayName: r.display_name,
            address: {
              road: r.address?.road || "",
              city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || "",
              state: r.address?.state || "",
              postcode: r.address?.postcode || "",
            },
          })));
        } catch {
          res.json([]);
        }
      });
    });
  } catch (err) {
    next(err);
  }
};
