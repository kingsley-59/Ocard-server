const { hash, compare } = require("bcrypt");
const { sign, verify } = require("jsonwebtoken");
const { badRequestResponse, errorResponse, successResponse, unauthorizedResponse } = require("../helpers/apiResponse");
const UserModel = require("../models/UserModel");
const { sendOtpWithTermii, verifyOtpWithTermii } = require("../modules/Termii");


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.register = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, passcode } = req.body;

    try {
        const userExists = await UserModel.findOne({ '$or': [{ email }, { phoneNumber }] });
        if (userExists) return badRequestResponse(res, "User already exists");

        const passcodeHash = await hash(passcode, 10);
        const newUser = new UserModel({ firstName, lastName, email, phoneNumber, passcodeHash });
        await newUser.save();
        successResponse(res, 'Registeration successful', newUser.toObject());
    } catch (error) {
        errorResponse(res, error.message);
    }
};

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.login = async (req, res) => {
    const { phoneNumber, email, passcode } = req.body;

    try {
        let condition = phoneNumber ? { phoneNumber } : { email };
        const user = await UserModel.findOne(condition);
        const validPasscode = compare(passcode, user.passcodeHash);
        if (!validPasscode) return unauthorizedResponse(res, "Incorrect password!");
        if (user.status !== 'active') return badRequestResponse(res, `This account has been ${user.status}`);

        const payload = { id: user._id, email: user.email, phoneNumber: user.phoneNumber, role: user.role };
        const token = sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        successResponse(res, 'Login successful.', { ...user.toObject(), password: undefined, token });
    } catch (error) {
        errorResponse(res, error.message);
    }
};

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.generateOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const user = await UserModel.findOne({phoneNumber});
        if (!user) return badRequestResponse(res, "Account with this number does not exist");

        const { pinId } = await sendOtpWithTermii(phoneNumber);
        if (!pinId) return errorResponse(res, "Something went wrong while sending otp");

        const authToken = sign({pinId, phoneNumber}, process.env.JWT_SECRET, {expiresIn: '1d'});
        successResponse(res, "Otp sent!", {authToken});
    } catch (error) {
        errorResponse(res, error.message);
    }
};

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.verifyOtp = async (req, res) => {
    const { otp, authToken } = req.body;
    if (!authToken) return badRequestResponse(res, "otp auth token is required!");

    try {
        const { pinId } = verify(authToken, process.env.JWT_SECRET);
        if (!pinId) return badRequestResponse(res, "You passed an invalid token");
        
        const result = await verifyOtpWithTermii(otp, pinId);
        if (!result) return badRequestResponse(res, "Otp verification failed");
        if (result.verified !== true) return badRequestResponse(res, "Incorrect otp");

        successResponse(res, 'Otp verified.');
    } catch (error) {
        const respData = error?.response?.data;
        if (respData?.verified === "Expired") {
            return errorResponse(res, "Otp has expired! Please try again.", respData?.status);
        } else if (respData?.verified === "Insufficient funds") {
            return errorResponse(res, "Insuffiecient funds");
        } else errorResponse(res, 'Something went wrong while verifying otp.');
    }
};