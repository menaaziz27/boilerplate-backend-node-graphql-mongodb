const { Users } = require('../../data/models/index');
const { createAuthToken } = require('../auth/jwt');
const { authValidations } = require('../auth/validations');
const { securityVariablesConfig } = require('../../config/appConfig');

const bcrypt = require('bcrypt');

module.exports = {
	Query: {
		listAllUsers:  async (root, args, context) => {
			if (!authValidations.isLogged(context)) {
				//throw new Error('You must be logged in to perform this action');
				return null;
			}

			if (!authValidations.isAdmin(context)) {
				//throw new Error('You must be an administrator to perform this action');
				return null;
			}

			const users = await Users.find({});
			return users;
		}
	},
	Mutation: {
		registerUser: async (root, { email, password }) => {

			const isAnEmailAlreadyRegistered = await Users.findOne({email});

			if (isAnEmailAlreadyRegistered) {
				throw new Error('Data provided is not valid');
			}

			await new Users({email, password}).save();

			const user = await Users.findOne({email});

			return {
				token: createAuthToken({ email: user.email, isAdmin: user.isAdmin, isActive: user.isActive, uuid: user.uuid }, securityVariablesConfig.secret, securityVariablesConfig.timeExpiration)
			};
		},
		/**
		 * It allows users to authenticate. Users with property isActive with value false are not allowed to authenticate. When a user authenticates the value of lastLogin will be updated
		 */
		authUser: async (root, { email, password }) => {
			const user = await Users.findOne({email, isActive: true});

			if (!user) {
				throw new Error('User not found or login not allowed');
			}

			const isCorrectPassword = await bcrypt.compare(password, user.password);

			if (!isCorrectPassword) {
				throw new Error('Invalid credentials');
			}

			await Users.findOneAndUpdate({email}, { lastLogin: new Date().toISOString() }, { new: true });

			return {
				token: createAuthToken({ email: user.email, isAdmin: user.isAdmin, isActive: user.isActive, uuid: user.uuid }, securityVariablesConfig.secret, securityVariablesConfig.timeExpiration)
			};
		}
	}
};
