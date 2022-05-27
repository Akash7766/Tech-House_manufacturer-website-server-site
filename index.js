const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect with mongoDb atlas database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g3r1l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
  } finally {
    // .
  }
}
run().catch(console.dir);

// This is the root api
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// listening port
app.listen(port, () => {
  console.log(`Tech house server running on port ${port}`);
});
