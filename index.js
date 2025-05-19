const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://coffee-store-8c21e.web.app"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbipbix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("coffeeDB");
    const coffeeCollection = db.collection("coffees");
    const usersCollection = db.collection("users");

    // Coffees GET
    app.get("/coffees", async (req, res) => {
      const result = await coffeeCollection.find().toArray();
      res.send(result);
    });

    // Coffees POST
    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    // Coffees GET by ID
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Coffees PUT (Update)
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      const result = await coffeeCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedCoffee },
        { upsert: true }
      );
      res.send(result);
    });

    // Coffees DELETE
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // get users

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // ✅ USERS POST (Create User)
    app.post("/users", async (req, res) => {
      try {
        const userProfile = req.body;
        console.log("Received User:", userProfile);

        const result = await usersCollection.insertOne(userProfile);

        res.send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ error: "Failed to insert user" });
      }
    });

    // delete user

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // update specific user

    app.patch("/users", async (req, res) => {
      console.log(req.body);
      const signInInfo = req.body;
      const { email, lastSignInTime } = signInInfo;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Optional GET for testing
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Test Ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // Optional: Leave empty to keep server running
  }
}
run().catch(console.dir);

// Root
app.get("/", (req, res) => {
  res.send("☕ Coffee server is hot!");
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
