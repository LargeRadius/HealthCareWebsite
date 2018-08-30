var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);


router.get("/", function(req, res) {
    Campground.find({}, function (err, Campgrounds) {
        if (err) {
            console.log(err);
        } else {
            //console.log(Campgrounds);
            res.render("campgrounds/index", {data:Campgrounds, page: 'posts'});
        }
    });
    
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          console.log(err);
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        if (location == null) {
            req.flash("error", "Location doesn't exist");
            res.redirect("back");
        }
        var newData = {
            name: name,
            image: image,
            description: desc,
            price : price,
            author: {
                id: req.user._id,
                username: req.user.username
            },
            location: location,
            lat: lat,
            lng: lng
        };
        // Create a new campground and save to DB
        Campground.create(newData, function(err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                req.flash("success","New Post created");
                res.redirect("/posts");
            }
        });
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Post is not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
    
});


//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err || !foundCampground) {
            console.log(err);
            req.flash("error", "Post is not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground:foundCampground});
        }
    });
    
});

//Update route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        
        var newCampground = req.body.campground;
        newCampground.lat = lat;
        newCampground.lng = lng;
        newCampground.location = location;
        if (location == null) {
            req.flash("error", "Location doesn't exist");
            res.redirect("back");
        }
        
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id, newCampground, function(err, campground){
            if(err){
                req.flash("error", "Post is not found");
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/posts/" + campground._id);
            }
        });
  });
});


//destroy router
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/posts");
        } else {
            req.flash("error", "Post deleted");
            res.redirect("/posts");
        }
    });
});


module.exports = router;