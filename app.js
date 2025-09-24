if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({override: true});
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");//for ejs
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const ejsMate = require("ejs-mate");
const favicon = require('serve-favicon');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");


app.use(methodOverride("_method"));//for put and delete request
//requiring ejs-mate
app.engine("ejs", ejsMate);//for using ejs-mate


// MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

//call main function
main().then(() => {
    console.log("Connected to DB");
})
.catch((err) =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    }
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
}

//setting view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//for read operation
app.use(express.urlencoded({extended:true})); 
//to use static file
app.use(express.static(path.join(__dirname, "/public")));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(session(sessionOptions));
app.use(flash());

//passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user || null;
    next();
});

// API request
app.get("/" , (req ,res)=>{
    res.redirect("/listings");
});

app.get("/demouser", async(req, res)=>{
    const fakeUser = new User({username: "demouser", 
        email: "demouser@gmail.com",
    });
    const newUser = await User.register(fakeUser, "demopassword");
    res.send(newUser);
});


//listing routes
app.use("/listings", listingRouter);
//review routes
app.use("/listings/:id/reviews", reviewRouter);
//user routes
app.use("/", userRouter);


app.use((req, res, next) => {
  console.log("METHOD:", req.method, "URL:", req.url);
  next();
});

app.get('/favicon.ico', (req,res)=>res.status(204).end());

//for invalid routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//server listening
app.use((err, req, res, next)=>{
    const {statusCode = 500 , message = "Something went wrong"} = err;
    console.log(err);
    res.status(statusCode).render("listings/error.ejs" ,{message});
});

app.listen(8080 , ()=>{
    console.log("server is running on port 8080");
})