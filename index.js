const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const schoolRoutes = require("./routes/schools");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/", schoolRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
