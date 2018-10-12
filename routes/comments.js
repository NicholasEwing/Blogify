const express = require("express");
// Look up what mergeParams does and study it!
const router = express.Router({mergeParams: true});
const Blog = require("../models/blog");
const Comment = require("../models/comment");

// require login middleware for all routes
router.get("/new", function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {blog: blog});
		}
	});
});

router.post("/", function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
					res.redirect("/blogs");
				} else {
					blog.comments.push(comment);
					blog.save();
					res.redirect("/blogs/" + blog._id);					
				}
			});
		}
	});
});
	// blog findbyid
	// create comment
		// push comments
		// save blog
		// redirect



module.exports = router;