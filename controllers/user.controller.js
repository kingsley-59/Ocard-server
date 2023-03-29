const { errorResponse, badRequestResponse, successResponse, notFoundResponse } = require("../helpers/apiResponse");
const CardModel = require("../models/CardModel");
const UserModel = require("../models/UserModel");


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.getUser = async (req, res) => {
    const {id} = req.user;
    try {
        const user = await UserModel.findById(id);
        if (!user) return badRequestResponse(res, "This user no longer exists");

        successResponse(res, "Success", {...user.toObject()});
    } catch (error) {
        errorResponse(res, error.message);
    }
};

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.getUserCards = async (req, res) => {
    const {id: userId} = req.user;

    try {
        const cards = await CardModel.findOne({user: userId});
        if (!cards) return notFoundResponse(res, "No cards availbale");

        successResponse(res, "Success", {...cards.toObject()});
    } catch (error) {
        errorResponse(res, error.message);
    }
};