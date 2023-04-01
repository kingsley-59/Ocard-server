const { uuid } = require("uuidv4");
const { errorResponse, successResponse, badRequestResponse } = require("../helpers/apiResponse");
const { verifyTransactionReference, createTransferRecipient, chargeAuthorization, transferToRecipient } = require("../modules/Paystack");



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

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.initiateTransfer = async (req, res) => {
    const { authorization_code, email, amount, account_name, account_number, bank_code } = req.body;

    try {
        // create transfer recipient
        const { recipient_code } = await createTransferRecipient(account_name, account_number, bank_code);

        // charge card
        const { status, reference } = await chargeAuthorization(authorization_code, email, amount);
        if (status !== 'success') return badRequestResponse(res, `Attempt to charge card failed. TxnRef: ${reference}`);

        // transfer to recipient
        const transferRef = uuid();
        const { message, ...transferResponse } = await transferToRecipient(amount, recipient_code, transferRef);

        successResponse(res, message, transferResponse);
    } catch (error) {
        console.log(error);
        errorResponse(res, error.message);
    }
};