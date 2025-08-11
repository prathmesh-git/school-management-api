School Management API
A simple Node.js + Express API for managing school data with MySQL as the database.
Supports adding new schools and retrieving schools sorted by proximity to a given location.

Features
Add new schools with name, address, and coordinates.

Retrieve a list of schools sorted by distance.

MySQL database integration.

Tech Stack
Node.js

Express.js

MySQL

Endpoints
POST /schools – Add a new school.
GET /schools?lat={latitude}&lng={longitude} – Get nearby schools sorted by distance.

Setup
bash
Copy
Edit
git clone <repo-url>
cd school-management-api
npm install
node index.js
Deployment
You can deploy this API using Vercel, Railway, or Render.
