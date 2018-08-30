var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name: String,
    price:String,
    image: String,
    location:String,
    lat: Number,
    lng: Number,
    description: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, {usePushEach: true});

module.exports = mongoose.model("Campground", campgroundSchema);