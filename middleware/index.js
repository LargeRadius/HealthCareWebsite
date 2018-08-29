var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground is not found");
                res.redirect("back");
            } else {
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission for that!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        //res.redirect("back");
        res.redirect("/campgrounds/" + req.params.id);
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment is not found");
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission for that!");
                    //res.redirect("back");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        //res.redirect("back");
        res.redirect("/campgrounds/" + req.params.id);
    }
}

module.exports = middlewareObj;