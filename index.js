const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bejocb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("summerDb").collection("users");
    const classCollection = client.db("summerDb").collection("class");
    const instructorCollection = client.db("summerDb").collection("instructors");
    const cartCollection = client.db("summerDb").collection("carts");

    //users related apis
    app.get('/users', async (req, res) =>{
        const result = await usersCollection.find().toArray();
        res.send(result);
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        console.log(user);
        const query = {email: user.email}
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
            return res.send({message: 'user already exists'})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    //class related api
    app.get('/class', async(req, res) => {
        const result = await classCollection.find().toArray();
        res.send(result);
    })

    //instructor related apis
    app.get('/instructors', async(req, res) => {
        const result = await instructorCollection.find().toArray();
        res.send(result);
    })

    //selected class
    app.get('/carts', async(req, res) => {
        const email = req.query.email;
        if(!email){
            res.send([]);
        }
        const query = { email: email};
        const result = await cartCollection.find(query).toArray();
        res.send(result);
    });

    app.post('/carts', async(req, res) => {
        const cls = req.body;
        console.log(cls);
        const result = await cartCollection.insertOne(cls);
        res.send(result);
    })

    app.delete('/carts/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('summer camp is running')
})

app.listen(port, () => {
    console.log(`Summer camp is running on port ${port}`);
})