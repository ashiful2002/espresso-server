const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbipbix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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

    // Connect to the "sample_mflix" database and
    //   access its "movies" collection

    // const database = client.db("sample_mflix");
    // const movies = database.collection("movies");

    const coffeeCollection = client.db("coffeeDB").collection("coffees");
    // read
    app.get("/coffees", async (req, res) => {
      // const cursor = coffeeCollection.find();
      // const result = await cursor.toArray();

      const result = await coffeeCollection.find().toArray();

      res.send(result);
    });
    //  post
    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });
    // update

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      //  one may use query to filter to better understanding
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    // update one data
    // app.put("/coffees/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedCofee = req.body;
    //   const updateDoc = {
    //     $set: updatedCofee,
    //   };
    //   const result = await coffeeCollection.updateOne(
    //     filter,
    //     updateDoc,
    //   );
    //   res.send(result)
    // });

    // update
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCofee = req.body;
      const updatedDoc = {
        $set: { updatedCofee },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);

      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffee server is getting hot!");
});

app.listen(port, () => {
  console.log(`coffee server is running on port ${port}`);
});
