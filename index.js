import express from 'express';

import path from 'path';

import { MongoClient, ObjectId } from 'mongodb';

const url = "mongodb://localhost:27017";

const dbName = 'taskmanager_db';

const collectionName = 'tasks';

const client = new MongoClient(url);

const connection = async () => {

    const connect = await client.connect();

    return await connect.db(dbName);

};

const publicPath = path.resolve('public');//it gives absolute path

const app = express();//create expression application instance

app.use(express.static(publicPath));//for static file

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", async (req, resp) => {

    const db = await connection();//call function

    const collection = db.collection(collectionName);

    const result = await collection.find().toArray();

    // console.log(result)

    resp.render("list", { result });//render template file
});

app.get("/add", (req, resp) => {
    resp.render("add");
});

app.post("/add", async (req, resp) => {

    const db = await connection();

    const collection = db.collection(collectionName);

    const result = collection.insertOne(req.body);

    if (result) {
        resp.redirect('/');
    } else {
        resp.redirect('/add');
    }

});



app.get("/delete/:_id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    // const result=collection.deleteOne(req.body)//we dont tells delete data on id 

    const result = collection.deleteOne({ _id: new ObjectId(req.params._id) });//tells delete data through the id

    if (result) {
        resp.redirect('/');
    } else {
        resp.send("something went wrong");
    }
});

app.get("/update/:_id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    // const result=collection.deleteOne(req.body)//we dont tells delete data on id 

    const result = await collection.findOne({ _id: new ObjectId(req.params._id) });//tells delete data through the id
    console.log(result);

    if (result) {
        resp.render('update', { result });
    } else {
        resp.send("something went wrong");
    }
});

app.post("/update/:_id", async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    // const result=collection.deleteOne(req.body)//we dont tells delete data on id 


    // const filter={_id:new ObjectId(req.params._id)}

    // const updateData={$set:{title:req.body.title,description:req.body.description}}

    const result = await collection.updateOne({ _id: new ObjectId(req.params._id) }, { $set: { title: req.body.title, description: req.body.description } });//tells delete data through the id
    console.log(result);

    if (result) {
        resp.redirect('/');
    } else {
        resp.send("something went wrong");
    }
});

app.post("/multi-delete", async (req, resp) => {

    const db = await connection();

    const collection = db.collection(collectionName);

    console.log(req.body.selectedTask);
   
    let selectedTask=undefined
      if(Array.isArray(req.body.selectedTask)){
             selectedTask = req.body.selectedTask.map((id) => new ObjectId(id));
      }else{
      selectedTask=[new ObjectId(req.body.selectedTask)]
      }

    console.log(selectedTask);

    const result = await collection.deleteMany({_id:{ $in: selectedTask }});

    if (result) {
        resp.redirect('/');
    } else {
        resp.send("something went wrong");
    }

});

app.listen(3200);