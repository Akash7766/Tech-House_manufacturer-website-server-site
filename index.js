const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cli = require("nodemon/lib/cli");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect with mongoDb atlas database
const uri = `mongodb+srv://Akash:uWxTjmMzfgaXARaP@cluster0.g3r1l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// verify jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authoraization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthoraze access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.secret, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Auth forbiden" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("tech-house").collection("products");
    const reviewsCollection = client.db("tech-house").collection("reviews");
    const OrdersCollection = client.db("tech-house").collection("orders");
    const usersCollection = client.db("tech-house").collection("users");

    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const requesterEmail = req.decoded.email;
      const requester = await usersCollection.findOne({
        email: requesterEmail,
      });
      if (requester.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "Access forbiden" });
      }
    };
    //***********************  Product related api *************
    // get all products api --
    app.get("/products", verifyJWT, async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    // get filter product by Id ----------------
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // add a new product by post api
    app.post("/products", verifyJWT, verifyAdmin, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // delete a single product api
    app.delete("/product/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // ************************** order related api *******************
    // order post api -------
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await OrdersCollection.insertOne(order);
      res.send(result);
    });

    // -- get all orders api --
    app.get("/orders", async (req, res) => {
      const result = await OrdersCollection.find().toArray();
      res.send(result);
    });
    // -- get orders filtering by email
    app.get("/myorders", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await OrdersCollection.find(query).toArray();
      res.send(result);
    });

    // delete order api
    app.delete("/order/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await OrdersCollection.deleteOne(query);
      res.send(result);
    });

    // delete customer order by him self
    app.delete("/myorder/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await OrdersCollection.deleteOne(query);
      res.send(result);
    });

    // delivery api
    app.put("/deliver/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: "delivered" },
      };
      const result = await OrdersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // ************************** user api  **************************
    // upsert user information
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.SECRET, {
        expiresIn: "1d",
      });
      res.send({ result, token });
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // make admin api
    app.put("/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // ************************* Review related api *****************
    // get all Reviews api ---
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);

      // post a single review
      app.post("/review", async (req, res) => {
        const order = req.body;
        const result = await reviewsCollection.insertOne(order);
        res.send(result);
      });
    });
  } finally {
    // .
  }
}
run().catch(console.dir);

// This is the root api
app.get("/", (req, res) => {
  res.send("Hello World Heroku!");
});

// listening port
app.listen(port, () => {
  console.log(`Tech house server running on port ${port}`);
});
