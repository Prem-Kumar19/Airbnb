const Listing = require("../models/listing.js");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = (async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews" , populate: { path: "author" } }).populate("owner");
        if(!listing){
             req.flash("error" , "Listing you requested for does not exist");
             res.redirect("/listings");
        }
        console.log(listing);
    res.render("listings/show.ejs", {listing});
});

module.exports.createListing = (async (req,res,next)=>{
    const url = req.file.path;
    const filename = req.file.filename;
    const data = req.body.listing;

  // If the user didn't provide an image URL, drop the entire image object
  if (!data.image || !data.image.url || data.image.url.trim() === "") {
    delete data.image;        // <- this is key
  }
        const newListing = new Listing(data);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        await newListing.save();
        req.flash("success" , "Added a new listing!");
        res.redirect("/listings");
});

module.exports.renderEditForm = (async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
             req.flash("error" , "Listing you requested for does not exist");
             res.redirect("/listings");
        }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_200"); // Resize for display

    res.render("listings/edit.ejs", {listing , originalImageUrl});
});

module.exports.updateListing = (async(req,res)=>{
      const data = req.body.listing;

  // If no new image URL provided, delete image so old value remains
  if (!data.image || !data.image.url || data.image.url.trim() === "") {
    delete data.image;
  }
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, data, {runValidators:true, new:true});
    if(typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
  listing.image = { url, filename };
    await listing.save();
    }
     req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
});

module.exports.destroyListing = (async(req,res)=>{
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
     req.flash("success" , "Listing Deleted!");
    console.log("Deleted listing is : " , deletedListing);
    res.redirect("/listings");
});



