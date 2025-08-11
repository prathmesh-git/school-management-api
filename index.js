const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: "localhost", // your MySQL host
  user: "root", // your MySQL username
  password: "yourpassword", // your MySQL password
  database: "school_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper: Validate school input
function validateSchool(data) {
  const { name, address, latitude, longitude } = data;
  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === "" ||
    !address ||
    typeof address !== "string" ||
    address.trim() === "" ||
    typeof latitude !== "number" ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    longitude < -180 ||
    longitude > 180
  ) {
    return false;
  }
  return true;
}

// Haversine formula for distance calculation in kilometers
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST /addSchool
app.post("/addSchool", async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    if (!validateSchool(req.body)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const sql =
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(sql, [
      name,
      address,
      latitude,
      longitude,
    ]);

    res
      .status(201)
      .json({ message: "School added successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /listSchools?latitude=...&longitude=...
app.get("/listSchools", async (req, res) => {
  try {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    if (
      isNaN(userLat) ||
      userLat < -90 ||
      userLat > 90 ||
      isNaN(userLon) ||
      userLon < -180 ||
      userLon > 180
    ) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const [schools] = await pool.query("SELECT * FROM schools");

    // Calculate distance for each school
    const schoolsWithDistance = schools.map((school) => {
      const distance = getDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      );
      return { ...school, distance_km: distance };
    });

    // Sort by distance
    schoolsWithDistance.sort((a, b) => a.distance_km - b.distance_km);

    res.json(schoolsWithDistance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
