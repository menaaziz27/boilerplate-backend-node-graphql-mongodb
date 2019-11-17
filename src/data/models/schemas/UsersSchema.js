const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

/**
 * Users schema
 * @constructor Users model constructor
 * @classdesc User have interesting properties. Some of the are isAdmin (false by default), isActive (true by default. Created to remove login permission to already registered user), uuid (random and unike token. Created to provided a unique value for every user different from _id native MongoDB value)
 */
const UsersSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true
	},
	isAdmin: {
		type: Boolean,
		required: true,
		default: false
	},
	isActive: {
		type: Boolean,
		required: true,
		default: true
	},
	uuid: {
		type: String,
		required: true,
		unique: true,
		default: uuidv4()
	},
	registrationDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	lastLogin: {
		type: Date,
		required: true,
		default: Date.now
	}
});

// Hash the password of user before save on database
UsersSchema.pre('save', function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	bcrypt.genSalt((err, salt) => {
		if (err) {
			return next(err);
		}
		bcrypt.hash(this.password, salt, (err, hash) => {
			if (err) {
				return next(err);
			}
			this.password = hash;
			next();
		});
	});
});

module.exports = UsersSchema;
