if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js")
const session=require("express-session")
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const sessionSecret=process.env.SECRET || "devsecret";

main()
 .then(()=>{
    console.log("connected to DB")
 })
 .catch((err)=>{
    console.log(err);
 });

async function main(){
    await mongoose.connect(dbUrl);
};

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// })
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public")));

const store=process.env.ATLASDB_URL
  ? MongoStore.create({
      mongoUrl:dbUrl,
      crypto:{
        secret:sessionSecret,
      },
      touchAfter:24*3600,
    })
  : null;

if(store){
  store.on("error",(err)=>{
    console.log("Error in mongo session store",err);
  })
}

const sessionOptions={
  secret:sessionSecret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  },
};

if(store){
  sessionOptions.store=store;
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//session is used so that user dont have to login again n again when they switch to diff pages of the same site
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //serialize- store user realted info in session
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/", (req, res) => {
//     res.render("listings/index.ejs"); // It's better to render a page than send a simple message
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// It’s a special Express function that catches any error thrown anywhere in your app.
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).render("error.ejs", { message });
  // res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});

