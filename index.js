const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cli = require("nodemon/lib/cli");
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
    const productsCollection = client.db("tech-house").collection("products");
    const reviewsCollection = client.db("tech-house").collection("reviews");
    const OrdersCollection = client.db("tech-house").collection("orders");
    //***********************  Product related api *************
    // get all products api --------------------------------------
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    // get filter product by Id ----------------------------------
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // ************************** order related api *******************
    // order post api -------------------------------------------
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await OrdersCollection.insertOne(order);
      res.send(result);
    });
    // ************************* Orders related api *************************
    // -------------------- get all orders api --------------------
    app.get("/orders", async (req, res) => {
      const result = await OrdersCollection.find().toArray();
      res.send(result);
    });
    // -------------------- get orders filtering by email --------------------
    app.get("/myorders", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await OrdersCollection.find(query).toArray();
      res.send(result);
    });

    // ************************* Review related api *****************
    // get all Reviews api ---------------------------------------
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
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
