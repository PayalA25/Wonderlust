const express = require ("express") ; 
const router = express.Router() ; 
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner ,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})



router
  .route("/")
  .get( wrapAsync(listingController.index)) //index route 
  .post( //create route
  isLoggedIn ,
  validateListing, 
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing) 
  );
  

  //new route 
router.get("/new" ,isLoggedIn ,  listingController.renderNewForm);


//serch by name of country 
router.get('/search', async (req, res) => {
  try {
    const { country } = req.query;

    // If no country is provided, redirect to all listings
    if (!country) {
      return res.redirect('/listings');
    }

    // Perform case-insensitive search by country
    const listings = await Listing.find({
      country: { $regex: new RegExp(country, 'i') }
    });

    // Render the view and pass results
    res.render('listings/index', {allListings:  listings, country });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))//show route
  .put(//update Route 
    isLoggedIn ,
    isOwner ,  
    upload.single("listing[image]"),
    validateListing , 
    wrapAsync(listingController.updateListing))
  .delete(  //delete
    isOwner , 
    isLoggedIn ,
    wrapAsync(listingController.destroyListing))
 
//edit 
router.get("/:id/edit" ,
  isLoggedIn ,
  isOwner , 
   wrapAsync(listingController.renderEditForm));



module.exports = router ;