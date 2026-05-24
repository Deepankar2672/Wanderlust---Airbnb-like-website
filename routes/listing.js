const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listing.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({storage});

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );
   
//Search
router.get("/search",listingController.searchListing);

// New
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show
router.get("/:id", wrapAsync(listingController.showListing));

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));

// Delete
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
module.exports = router;