const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage });


//index route (1st route) for read operation
//create route (4th route) for create operation
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn ,upload.single("listing[image][url]") , validateListing , wrapAsync( listingController.createListing));

//new route (3rd route) to show form
router.get("/new" , isLoggedIn , listingController.renderNewForm);

//show route (2nd route) for read operation
//update route (6th route) for update operation
//delete route (7th route) for delete operation
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn , isOwner , upload.single("listing[image][url]") , validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn , isOwner , wrapAsync( listingController.destroyListing));

//edit route (5th route) to show edit form
router.get("/:id/edit", isLoggedIn , isOwner, wrapAsync( listingController.renderEditForm));

module.exports = router;
