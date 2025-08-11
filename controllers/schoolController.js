const pool = require("../config/db");
const getDistance = require("../utils/distance");

// Validation
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

// Add School
exports.addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!validateSchool(req.body)) {
    return res.status(400).json({ error: "Invalid input data" });
  }
  try {
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
};

// List Schools
exports.listSchools = async (req, res) => {
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
  try {
    const [schools] = await pool.query("SELECT * FROM schools");
    const schoolsWithDistance = schools.map((school) => ({
      ...school,
      distance_km: getDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      ),
    }));
    schoolsWithDistance.sort((a, b) => a.distance_km - b.distance_km);
    res.json(schoolsWithDistance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
