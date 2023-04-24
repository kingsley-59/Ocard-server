const { uuid } = require("uuidv4");
const { errorResponse, successResponse, badRequestResponse } = require("../helpers/apiResponse");
const { verifyTransactionReference, createTransferRecipient, chargeAuthorization, transferToRecipient, refundTransaction } = require("../modules/Paystack");



/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.verifyTransaction = async (req, res) => {
    // eslint-disable-next-line no-unused-vars
    // const {id} = req.user;
    const { reference } = req.params;

    try {
        const response = await verifyTransactionReference(reference);

        // refund transaction
        const { message } = await refundTransaction(reference);

        // save transaction

        // check if signature in database, or save he card

        // return success for the transaction verification
        successResponse(res, 'Verification successful. ' + message, response);
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
    const { authorization_code, ref_code, email, amount, account_name, account_number, bank_code } = req.body;
    let userDebited = false;
    let debitReference;

    try {
        // create transfer recipient
        const { recipient_code } = await createTransferRecipient(account_name, account_number, bank_code);

        // charge card
        if (authorization_code) {
            const { status, reference } = await chargeAuthorization(authorization_code, email, amount);
            if (status !== 'success') return badRequestResponse(res, `Attempt to charge card failed. TxnRef: ${reference}`);
            userDebited = true;
            debitReference = reference;

            // transfer to recipient
            const transferRef = uuid();
            const { message, ...transferResponse } = await transferToRecipient(amount, recipient_code, transferRef);

            successResponse(res, message, transferResponse);
        } else if (ref_code) {
            const { status, amount: verifiedAmount } = await verifyTransactionReference(ref_code);
            if (status !== 'success') return badRequestResponse(res, 'Could not verify payment made with card.');
            userDebited = true;
            debitReference = ref_code;

            // transfer amount to recipient
            const transferRef = uuid();
            const { message, ...transferResponse } = await transferToRecipient(verifiedAmount, recipient_code, transferRef);
            successResponse(res, message, transferResponse);
        } else badRequestResponse(res, 'Either a card token or a reference is required.');

    } catch (error) {
        console.log(error);
        // refund user if transfer was unsuccessful
        try {
            let refundMsg = userDebited ? (await refundTransaction(debitReference)).message : null;
            errorResponse(res, `${error.message}. ${refundMsg}`);
        } catch (err) {
            errorResponse(res, `${error.message}.`);
        }
    }
};