require('dotenv').config();

var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    flash               = require("connect-flash"),
    Campground          = require("./models/campground"),
    Comment             = require("./models/comment"),
    methodOverride      = require("method-override"),
    User                = require("./models/user"),
    seedDB              = require("./seeds");

var indexRoutes         = require("./routes/index"),
    commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds");
    
//mongoose.connect("mongodb://localhost/yelp_camp_v13", {useMongoClient: true});
mongoose.connect("mongodb://ding:4180thgfth@ds237932.mlab.com:37932/heathcare", {useMongoClient: true});
// mongodb://ding:4180thgfth@ds237932.mlab.com:37932/heathcare
mongoose.Promise = global.Promise;
//seedDB();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "I don't like trustworthy course",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.locals.moment = require('moment');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success     = req.flash("success");
    res.locals.error       = req.flash("error");
    next();
});


app.use("/posts", campgroundRoutes);
app.use("/", indexRoutes);
app.use("/posts/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp Final version server has started");
}); 

//Google map API:AIzaSyBaD2g-4Bp3eGr4Nwtozt897-IMCZxY9B0