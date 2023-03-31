const { errorResponse, successResponse } = require("../helpers/apiResponse");
const { verifyTransactionReference } = require("../modules/Paystack");



/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.verifyTransaction = async (req, res) => {
    // eslint-disable-next-line no-unused-vars
    // const {id} = req.user;
    const {reference} = req.params;

    try {
        const data = await verifyTransactionReference(reference);

        // save transaction

        // check if signature in database, or save he card

        // return success for the transaction verification
        successResponse(res, "Transaction successful.", data);
    } catch (error) {
        errorResponse(res, error?.message, error?.status);
    }
};