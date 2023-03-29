const { successResponse, errorResponse } = require("../helpers/apiResponse");
const { resolveBankDetails, listAllBanks } = require("../modules/Paystack");
require('dotenv').config();

exports.getBankDetails = async (req, res) => {
    const { accountNumber, bankCode } = req.body;

    try {
        const response = await resolveBankDetails(accountNumber, bankCode) ;
        console.log(response);

        successResponse(res, 'Success', response);
    } catch (error) {
        errorResponse(res, error.message);
    }
};

exports.getAllBanks = async (req, res) => {
    try {
        const response = await listAllBanks();

        successResponse(res, 'Success', {...response, count: response.data.length});
    } catch (error) {
        errorResponse(res, error.message);
    }
};