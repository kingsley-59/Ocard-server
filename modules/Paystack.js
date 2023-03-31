const { default: axios } = require("axios");
const { errorResponse } = require("../helpers/apiResponse");
require('dotenv').config();


const API_URL = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_TEST_SECRET;

function createErrorWithStatus(message = '', status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

exports.listAllBanks = async (country = 'nigeria') => {
    const apiUrl = `https://api.paystack.co/bank?country=${country}`;

    try {
        const { data } = await axios.get(apiUrl, {headers: {Authorization: SECRET_KEY}});
        return data;
    } catch (error) {
        const errResponse = error.response;
        throw new Error(errResponse?.data?.message || "Failed to complete request.");
    }
};

exports.resolveBankDetails = async (account_number, bank_code) => {
    const apiUrl = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;

    try {
        const { data } = await axios.get(apiUrl, {headers: {Authorization: 'Bearer '+ SECRET_KEY}});
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
        const {data} = await axios.get(apiUrl, {headers: {Authorization: 'Bearer '+ SECRET_KEY}});

        return {...data.data};
    } catch (error) {
        console.log(error.response);
        const errResponse = error.response;
        const errorStatus = errorResponse?.status;
        const errorMessage = errResponse?.data?.message || error.message;
        throw createErrorWithStatus(errorMessage, errorStatus);
    }
};