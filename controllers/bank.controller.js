const { successResponse, errorResponse } = require("../helpers/apiResponse");
const { listAllBanks, resolveBankDetails } = require("../modules/Flutterwave");
// const { resolveBankDetails, listAllBanks } = require("../modules/Paystack");
require('dotenv').config();

exports.getBankDetails = async (req, res) => {
    const { accountNumber, bankCode } = req.body;

    try {
        const { data, message } = await resolveBankDetails(accountNumber, bankCode);

        successResponse(res, message, data);
    } catch (error) {
        errorResponse(res, error.message, error?.status);
    }
};

exports.getAllBanks = async (req, res) => {
    try {
        const { message, data } = await listAllBanks();

        successResponse(res, message, { banks: data, count: data?.length });
    } catch (error) {
        errorResponse(res, error.message);
    }
};