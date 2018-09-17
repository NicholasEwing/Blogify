const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
mongoose.connect("mongodb://localhost/blogcms", {useNewUrlParser: true});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));


app.set("view engine", "ejs");

// blog schema
let blogSchema = new mongoose.Schema({
	title: {type: String, unique: true},
	body: String,
});

let Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err) {
			console.log(err);
		}

		res.render("index", {blogs: blogs})
	});
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.post("/blogs", function(req, res){
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}

		res.redirect("blogs");
	});
});

app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs")
		}
		res.render("show", {blog: foundBlog});
	})
});

app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}

		res.render("edit", {blog: foundBlog});

	});
});

app.put("/blogs/:id", function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}

		res.redirect("/blogs/" + req.params.id);
	});
});

// add edit route
// add update route
// add update form
// add destroy route
// add error handling
// add images to blog posts
// sanitize input for blogs
// add login system
// add ability to comment

app.listen(3000, () => console.log("Server started on port 3000"));