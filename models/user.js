const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// user schema
let userSchema = new mongoose.Schema({
	username: {type: String, unique: true},
	posts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Blog"
		}
	]
});

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model("User", userSchema);

module.exports = User;