const express = require("express");
const router = express.Router();

let Blog = require("../models/blog");
let User = require("../models/user");
let Comment = require("../models/comment");
let middleware = require("../middleware");

// INDEX ROUTE
router.get("/", (req, res) => {
	Blog.find({}, (err, blogs) => {
		if(err) {
			req.flash("error toast", "Unable to render blog posts. Please try again later.");
			res.redirect("/blogs")
		}

		res.render("blogs/index", {blogs: blogs});
	});
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("blogs/new");
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err){
			req.flash("error", "That blog title already exists. Please edit title and try again.");
			res.render("blogs/new");
		} else {
			newBlog.author.id = req.user._id;
			newBlog.author.username = req.user.username;
			newBlog.save();
			User.findById(req.user._id, (err, user) => {
				if(err) {
					req.flash("error toast", "Failed to lookup author name. Please try again.");
				}
				user.blogs.push(newBlog);
				user.save();
			})
			res.redirect("/blogs");
		}

	});
});

// SHOW ROUTE
router.get("/:id", (req, res) => {
	Blog.findById(req.params.id).populate("comments").exec((err, foundBlog) => {
		if(err){
			req.flash("error toast", "That blog post does not exist.");
			res.redirect("/blogs");
		}
		res.render("blogs/show", {blog: foundBlog});
	});
});

// EDIT ROUTE
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			req.flash("error toast", "Couldn't open the edit view for this post. Please try again.");
			res.redirect("/blogs");
		}

		// Handles trying to edit blog on another tab after it has been deleted
		if(!foundBlog){
			req.flash("error toast", "That blog post does not exist.");
			res.redirect("/blogs");			
		}
		
		res.render("blogs/edit", {blog: foundBlog});
	});
});

// UPDATE ROUTE
router.put("/:id", middleware.isLoggedIn, (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
		if(err){
			req.flash("error toast", "Failed to update blog. Please try again.");
			res.redirect("/blogs");
		}

		if(!updatedBlog){
			req.flash("error toast", "That blog post does not exist.");
			res.redirect("/blogs");	
		}
		
		res.redirect("/blogs/" + req.params.id);
	});
});

// DELETE CONFIRM ROUTE
router.get("/:id/delete", middleware.isLoggedIn, (req, res) => {
		res.render("blogs/delete", {blog_id: req.params.id});
});

// DELETE ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res, next) => {

	if (err || !blog) {
		req.flash("error toast", "Could not remove blog.");
	}

	Blog.findById(req.params.id, (err, blog) => {
		Comment.find({_id: {$in: blog.comments}}, (err, comments) => {
			if(err) {
				req.flash("error toast", "Error pulling comments when deleting blog.");
				res.redirect("/");
			}

			User.updateMany({$pull: {comments: {$in: comments}}}, (err, users) => {
				if(err) {
					req.flash("error toast", "Error pulling comments from users.");
					res.redirect("/");
				}
			});
		});

		User.updateMany({$pull: {blogs: {$in: blog._id}}}, (err, user) => {
			if(err) {
				req.flash("error toast", "Error pulling blog from author.")
				res.redirect("/");
			}
		});

		blog.remove();
		req.flash("success toast", "Blog removed.");
		res.redirect("/");
	});
});

module.exports = router;
