const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// This is the root api
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Tech house server running on port ${port}`);
});
