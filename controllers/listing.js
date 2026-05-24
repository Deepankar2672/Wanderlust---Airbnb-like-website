const Listing=require("../models/listing")
const DEFAULT_GEOMETRY = {
  type: "Point",
  coordinates: [77.209, 28.6139],
};

const categoryKeywords = {
  trending: ["beach", "city", "mountain", "luxury", "villa", "cottage", "paradise"],
  rooms: ["apartment", "loft", "cottage", "villa", "penthouse", "condo", "hotel"],
  "iconic-cities": ["city", "downtown", "new york", "los angeles", "florence"],
  mountains: ["mountain", "cabin", "aspen", "ski", "chalet", "alps", "lake tahoe"],
  castles: ["villa", "historic", "tuscany", "florence"],
  pools: ["pool", "beach", "paradise", "condo", "resort"],
  camping: ["camp", "cabin", "treehouse", "lake", "nature", "outdoor"],
  farms: ["farm", "rustic", "countryside", "nature"],
  arctic: ["arctic", "snow", "ski", "chalet", "alps"],
  domes: ["dome", "treehouse", "unique", "getaway"],
};

const categoryLabels = {
  trending: "Trending",
  rooms: "Rooms",
  "iconic-cities": "Iconic Cities",
  mountains: "Mountains",
  castles: "Castles",
  pools: "Amazing Pools",
  camping: "Camping",
  farms: "Farms",
  arctic: "Arctic",
  domes: "Domes",
};

function listingMatchesKeywords(listing, keywords) {
  const searchableText = [
    listing.title,
    listing.description,
    listing.location,
    listing.country,
  ].join(" ").toLowerCase();

  return keywords.some((keyword) => searchableText.includes(keyword));
}

//Search logic 
module.exports.searchListing = async (req, res) => {
  const searchQuery = req.query.q; // user’s search text
  // If user didn’t type anything, show all listings
  if (!searchQuery) {
    const allListings = await Listing.find({}).populate("reviews");
    return res.render("listings/index.ejs", { allListings, searchQuery: "" });
  }
  const allListings = await Listing.find({}).populate("reviews");
  // convert both search text and listing fields to lowercase
  const filteredListings = allListings.filter(listing => {
    return (
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase())||
      listing.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  // 👉 Add this check (this is the line you asked for)
  if (filteredListings.length === 0) {
    req.flash("error", `No listings found for "${searchQuery}".`);
    return res.redirect("/listings"); // redirect back to main listings page
  }

  res.render("listings/index.ejs", {
    allListings: filteredListings,
    searchQuery,
    activeCategory: "",
  });
};



module.exports.index=async (req,res,next) => {
  const { category } = req.query;
  const listings = await Listing.find({}).populate("owner").populate("reviews");
  let allListings = listings;

  if(category && categoryKeywords[category]){
    allListings = listings.filter((listing) => listingMatchesKeywords(listing, categoryKeywords[category]));

    if(allListings.length === 0){
      req.flash("error", `No listings found for ${categoryLabels[category]}.`);
      return res.redirect("/listings");
    }
  }

  res.render("listings/index.ejs", {
    allListings,
    activeCategory: category || "",
  });
};

module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs"); 
};


module.exports.showListing=async (req,res,next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author",
      },
    })
     .populate("owner");
  if(!listing){
    req.flash("error","listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing=async (req,res,next) => {
    let url=`/uploads/${req.file.filename}`;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    newListing.geometry = DEFAULT_GEOMETRY;
    let savedListing=await newListing.save();
    console.log(savedListing);

    await newListing.save();
    req.flash("success","New listing created!!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res,next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","listing you requested does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
  originalImageUrl.replace("/upload","/upload/w_250")
  res.render("listings/edit.ejs", { listing,originalImageUrl});
};


module.exports.updateListing=async (req,res,next) => {
    let { id } = req.params;
    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
    let url=`/uploads/${req.file.filename}`;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }

    req.flash("success","Listing updated!!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing=async (req,res,next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing deleted!!");
  res.redirect("/listings");
};

module
