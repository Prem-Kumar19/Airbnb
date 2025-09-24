//requring mongoose
const mongoose = require("mongoose");
const initData = require("./data.js");//requiring data
const Listing = require("../models/listing.js");//requiring schema
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//calling main function 
main().then(() =>{
    console.log("connected to be DB");
}).catch((err) =>{
    console.log(err);
});

 //connnecting to server
 async function main() {
    await mongoose.connect(MONGO_URL);
 }

 //adding data to DB
 const initDB = async () =>{
    await Listing.deleteMany({});//deleting data of DB if present initally.
    initData.data = initData.data.map((obj) => ({
        ...obj , owner: new mongoose.Types.ObjectId("68ce494298cd9c896e73abf8")
    }));//storing data in DB
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
 }

 //calling initDB function
 initDB();
