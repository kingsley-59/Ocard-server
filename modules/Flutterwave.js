require('dotenv').config();
const flutterwave = require('flutterwave-node-v3');
const processRequestError = require('../helpers/processRequestError');
const { default: axios } = require('axios');

const mode = 'test';

const flw_public_key = mode === 'test' ? process.env.FLW_TEST_PUBLIC : process.env.FLW_PUBLIC_KEY;
const flw_secret_key = mode === 'test' ? process.env.FLW_TEST_SECRET : process.env.FLW_SECRET_KEY;

const flw = new flutterwave(flw_public_key, flw_secret_key);
const flwApiUrl = "https://api.flutterwave.com/v3";
const getAthHeader = (mode = 'test') => {
    let secret = mode === 'test' ? process.env.FLW_TEST_SECRET : process.env.FLW_SECRET_KEY;
    return {
        'headers': {
            'Authorization': 'Bearer ' + secret
        }
    };
};

exports.flw = flw;
exports.mode = mode;


exports.listAllBanks = async () => {
    try {
        const { data } = await axios.get(flwApiUrl + '/banks/NG', getAthHeader());
        return data;
    } catch (error) {
        throw processRequestError(error);
    }
};

/**
 * @param {string | Number} bank_id 
 * 
 * This accepts bank_id which is the unique bank code used to identify each bank.
 * You can get the bank code from the listAllBanks api
 */
exports.listBankBranches = async (bank_id) => {
    try {
        const payload = {

            "id": bank_id //Unique bank ID, it is returned in the call to fetch banks GET /banks/:country

        };
        const response = await flw.Bank.branches(payload);
        console.log(response);
        return response;
    } catch (error) {
        throw processRequestError(error);
    }
};

exports.resolveBankDetails = async (account_number, account_bank) => {
    try {
        const payload = {
            account_number, account_bank
        };
        const { data } = await axios.post(flwApiUrl + '/accounts/resolve', payload, getAthHeader('live'));
        return data;
    } catch (error) {
        throw processRequestError(error);
    }
};

exports.resolveBvnDetails = async (bvn) => {
    try {
        const payload = {
            bvn
        };
        const response = await flw.Misc.bvn(payload);
        console.log(response);
        return response;
    } catch (error) {
        throw processRequestError(error);
    }
};

/**
 * @param {*} id 
 * This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
 */
exports.verifyTransactionReference = async (id) => {
    try {
        const payload = { id };
        const response = await flw.Transaction.verify(payload);
        console.log(response);
    } catch (error) {
        throw processRequestError(error);
    }
};

/**
 * @param {string} id 
 * This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
 * @param {string | Number} amount 
 * 
 */
exports.refundTransaction = async (id, amount) => {
    try {
        const payload = {
            id, amount
        };
        const response = await flw.Transaction.refund(payload);
        console.log(response);
        return response;
    } catch (error) {
        throw processRequestError(error);
    }
};