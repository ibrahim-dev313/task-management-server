const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.50cvwuz.mongodb.net`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    // await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("database-management-project");
    const taskCollection = database.collection("tasks");

    app.post("/tasks", async (req, res) => {
        const { title, description, deadline, priority, userEmail } = req.body;
        const task = { title, description, deadline, priority, status: "todo", userEmail };

        const result = await taskCollection.insertOne(task);
        res.send(result);
    });

    app.get("/tasks/:userEmail", async (req, res) => {
        const userEmail = req.params.userEmail;
        const tasks = await taskCollection.find({ userEmail }).toArray();
        res.send(tasks);
    });

    app.put("/tasks/:taskId", async (req, res) => {
        const taskId = req.params.taskId;
        const { status } = req.body;

        const result = await taskCollection.updateOne({ _id: new ObjectId(taskId) }, { $set: { status } });
        res.send({ message: "Task status updated successfully", ...result });
    });

    app.put("/tasks/:taskId", async (req, res) => {
        try {
            const taskId = req.params.taskId;
            const data = req.body;
            console.log(data);

            const options = { upsert: true };

            const result = await taskCollection.updateOne(
                { _id: new ObjectId(taskId) },
                data
            );

            res.send(result);
        } catch (error) {
            res.send(error);

        }
    });

    app.delete("/tasks/:taskId", async (req, res) => {
        try {
            const taskId = req.params.taskId;

            const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });

            if (result.deletedCount === 0) {
                res.status(404).send({ error: "Task not found" });
            } else {
                res.send({ message: "Task deleted successfully", ...result });
            }
        } catch (error) {
            res.send(error);
        }
    });


    app.get("/", (req, res) => {
        res.send("Server is running");
    });



    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

run().catch(console.dir);
