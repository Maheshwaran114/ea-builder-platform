// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Simple route to check if the server is running
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
