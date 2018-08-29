var express    = require("express");
var router     = express.Router();
var passport   = require("passport");
var User       = require("../models/user");

//landing route
router.get("/", function(req, res) {
    res.render("campgrounds/landing");
});

//registration route
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

router.post("/register", function(req, res) {
   var newUser = new User({
       username: req.body.username,
       firstName: req.body.firstName,
       lastName: req.body.lastName,
       email: req.body.email,
       avatar: req.body.avatar
   });
   if (req.body.type === "Admin"&& req.body.adminCode === "secretCode123") {
       newUser.isAdmin = true;
   } else if (req.body.type === "Doctor"&& req.body.adminCode === "secretCode123") {
       newUser.isDoctor = true;
   }
   User.register(newUser, req.body.password, function(err, user) {
       if (err) {
           req.flash("error", err.message);
           return res.redirect("/register");
       }
       passport.authenticate("local")(req, res, function() {
           if (user.isAdmin) {
               req.flash("success","Welcome to YelpCamp " + user.username +"(Admin)");
           } else {
               req.flash("success","Welcome to YelpCamp " + user.username);
           }
           res.redirect("/posts"); 
        });
   });
});


//login route
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate("local", {
        successRedirect:"/posts",
        failureRedirect:"/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }), function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success","logged you out!");
    res.redirect("/");
});

router.get("/user/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if (err || !foundUser) {
            req.flash("error","User not found!");
            return res.redirect("back");
        }
        res.render("user", {user: foundUser});
    });
    
});

module.exports = router;