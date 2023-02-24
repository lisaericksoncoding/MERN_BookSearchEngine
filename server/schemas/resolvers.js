const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select("-__v -password").populate("books");
                return userData;
            };
            throw new AuthenticationError("You need to be logged in.");
        },
    },


Mutation: {
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthenticationError("Incorrect login!");
        };
        const correctPW = await user.isCorrectPassword(password);
            if (!correctPW) {
                throw new AuthenticationError("Incorrect login!");

            };

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (!context.user) {
              throw new AuthenticationError("You need to be logged in to be able to save!");
            }
            
            const updatedUser = await User
              .findOneAndUpdate(
                { _id: context.user._id }, 
                { $addToSet: { savedBooks: bookData } },
                { new: true },
              )
              .populate("books");
          
            return updatedUser;
          },
          removeBook: async (parent, { bookId }, context) => {
            if (!context.user) {
              throw new AuthenticationError("You need to be logged in to delete books!");
            }
            
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true },
            );
          
            return updatedUser;
          },
        },
    };
    
    module.exports = resolvers;