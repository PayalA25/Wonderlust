if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose") ; 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {listingSchema , reviewSchema} = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport"); 
const LocalStrategy = require("passport-local"); 
const User = require("./models/user.js") ;
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL ;
main()
.then(() =>{
     console.log("connected to db " ) ;
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store =MongoStore.create({
  mongoUrl : dbUrl, 
  crypto:{
    secret : process.env.SECRET  ,
  },
  touchAfter: 24*3600,
});

store.on("error" , () =>{
    console.log("Error in mongo sesseion store "), err}
  );

const sessionOptions = {
  store,
  secret :process.env.SECRET  ,
  resave : false, 
  saveUninitialized:true ,
  cookies:Date.now()+7*24*60*1000,
  maxAge :7*24*60*1000,
  httpOnly : true , 
} ;

/*app.get("/" , (req, res) =>{
    res.send("hello mf:") ; 
}) ; */



app.use(session (sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
  res.locals.success = req.flash("success") ;
  res.locals.error = req.flash("error") ;
  res.locals.currUser =req.user ;
  next();
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);


/*
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});*/

// Central error handler
app.use((err, req, res, next) => {
   let { statusCode = 500, message = "somethink went wrong "} = err;
 res.status(statusCode).render("error.ejs" ,{ message});
});

app.listen(8080 , () => {
    console.log("listening on the port ") ; 
});


/*
app.get("/testListing" , async  (req , res) =>{
  let sampleListing = new Listing ({
    title:"my villa",
    description:"by the side of beatch ... bitch fav ",
    price:1200 , 
    location :"Calangute , Goa" , 
    country :"india",
  });

    await sampleListing.save();
    console.log("saved sample ") ; 
    res.send("saved sucessfuly")
});
*/
