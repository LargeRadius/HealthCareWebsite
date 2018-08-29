var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//creat new comment GET route
router.get("/new", middleware.isLoggedIn, function(req, res) {
     Campground.findById(req.params.id, function(err, campground) {
         if (err || !campground) {
            req.flash("error", "Post is not found");
            res.redirect("/posts/" + req.params.id);
         } else {
            res.render("comments/new", {campground : campground});
         }
     });
});
//creat new comment POST route
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
         if (err || !campground) {
             req.flash("error", "Post is not found");
             res.redirect("/posts/" + req.params.id);
         } else {
             Comment.create(req.body.comment, function(err, comment) {
                 if (err) {
                     console.log(err);
                 } else {
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     comment.save();
                     console.log(comment);
                     campground.comments.push(comment);
                     campground.save();
                     req.flash("success","New comment created");
                     res.redirect("/posts/" + campground._id);
                 }
             });
         }
     });
});

//edit comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err || !foundComment) {
            req.flash("error", "Comment is not found");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
}); 

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment) {
        if (err || !foundComment) {
            req.flash("error", "Comment is not found");
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/posts/" + req.params.id);
        }
    });
});

//destroy comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            console.log(err);
            req.flash("error", "Didn't find that comment");
            res.redirect("back");
        } else {
            req.flash("error", "Comment deleted");
            res.redirect("/posts/" + req.params.id);
        }
    });
});



module.exports = router;