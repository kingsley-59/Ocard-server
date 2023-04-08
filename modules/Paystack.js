const { default: axios } = require("axios");
const { errorResponse } = require("../helpers/apiResponse");
require('dotenv').config();


const API_URL = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_LIVE_SECRET;
const paystackRequestConfig = {
    headers: {
        "Authorization": 'Bearer ' + SECRET_KEY,
        "Content-Type": 'application/json'
    }
};

function createErrorWithStatus(message = '', status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}
function processRequestError(error) {
    const finalError = new Error();
    const response = error.response;
    const status = error.status;
    const message = response.data?.message || error.message;
    finalError.message = message;
    finalError.status = status;

    return finalError;
}

exports.listAllBanks = async (country = 'nigeria') => {
    const apiUrl = `https://api.paystack.co/bank?country=${country}`;

    try {
        const { data } = await axios.get(apiUrl, paystackRequestConfig);
        return data;
    } catch (error) {
        const errResponse = error.response;
        throw new Error(errResponse?.data?.message || "Failed to complete request.");
    }
};

exports.resolveBankDetails = async (account_number, bank_code) => {
    const apiUrl = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;

    try {
        const { data } = await axios.get(apiUrl, { headers: { Authorization: 'Bearer ' + SECRET_KEY } });
        if (data.status) {
            const { account_number, account_name } = data.data || {};
            return { account_name, account_number };
        } else throw new Error("Account number verification failed.");
    } catch (error) {
        const errResponse = error.response;
        const errorStatus = errorResponse?.status;
        const errorMessage = errResponse?.data?.message || error.message;
        throw createErrorWithStatus(errorMessage, errorStatus);
    }
};

exports.verifyTransactionReference = async (reference) => {
    const apiUrl = `${API_URL}/transaction/verify/${reference}`;

    try {
        const { data } = await axios.get(apiUrl, paystackRequestConfig);

        return { ...data.data };
    } catch (error) {
        console.log(error.response);
        const errResponse = error.response;
        const errorStatus = errorResponse?.status;
        const errorMessage = errResponse?.data?.message || error.message;
        throw createErrorWithStatus(errorMessage, errorStatus);
    }
};

exports.refundTransaction = async (reference, amount = undefined) => {
    const apiUrl = `${API_URL}/refund`;
    try {
        const payload = { transaction: reference, amount };
        const { message, data } = (await axios.post(apiUrl, payload, paystackRequestConfig)).data;

        return {message, data};
    } catch (error) {
        throw processRequestError(error);
    }
};

exports.createTransferRecipient = async (name, account_number, bank_code) => {
    const apiUrl = `${API_URL}/transferrecipient`;
    try {
        const payload = { type: 'nuban', currency: 'NGN', name, account_number, bank_code };
        const { message, data } = (await axios.post(apiUrl, payload, paystackRequestConfig)).data;

        return {
            message,
            recipient_code: data.recipient_code,
            domain: data.domain,
            createdAt: data.createdAt,
            ...data.details
        };
    } catch (error) {
        throw processRequestError(error);
    }
};

exports.transferToRecipient = async (amount, recipient, reference, reason = "") => {
    const apiUrl = `${API_URL}/transfer`;
    try {
        const payload = { source: "balance", amount, recipient, reason, reference };
        const { message, data } = (await axios.post(apiUrl, payload, paystackRequestConfig)).data;

        return {
            message,
            amount: data.amount,
            reference: data.reference,
            transferCode: data.transfer_code
        };
    } catch (error) {
        throw processRequestError(error);
    }
};

exports.chargeAuthorization = async (authorization_code, email, amount) => {
    const apiUrl = `${API_URL}/transaction/charge_authorization`;
    try {
        const payload = { authorization_code, email, amount };
        const { message, data } = (await axios.post(apiUrl, payload, paystackRequestConfig)).data;

        return {
            message,
            status: data.status,
            reference: data.reference,
            channel: data.channel,
            amount: data.amount,
            authorization: data.authorization
        };
    } catch (error) {
        throw processRequestError(error);
    }
};