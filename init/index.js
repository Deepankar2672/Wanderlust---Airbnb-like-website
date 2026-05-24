require("dotenv").config();

const DEFAULT_GEOMETRY = {
  type: "Point",
  coordinates: [77.209, 28.6139],
};


const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const dbUrl=process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

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

// const initDB=async ()=>{
//     await Listing.deleteMany({});
//     initData.data=initData.data.map((obj)=>({...obj,owner:"68c65a11742bbc51835fae62"}));
//     await Listing.insertMany(initData.data);
//     console.log("Data was initialized")
// }
// initDB();

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Old data deleted!");

  for (let obj of initData.data) {
    const newListing = new Listing({
      ...obj,
      owner: "68c65a11742bbc51835fae62", // your user id
      geometry: DEFAULT_GEOMETRY,
    });

    await newListing.save();
    console.log(`✅ Added listing: ${obj.title}`);
  }

  console.log("✅ All data seeded successfully with geometry!");
};
initDB();
