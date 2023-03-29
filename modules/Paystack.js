const { default: axios } = require("axios");



exports.listAllBanks = async (country = 'nigeria') => {
    const apiUrl = `https://api.paystack.co/bank?country=${country}`;

    try {
        const { data } = await axios.get(apiUrl);
        return data;
    } catch (error) {
        const errResponse = error.response;
        throw new Error(errResponse?.data?.message || "Failed to complete request.");
    }
};

exports.resolveBankDetails = async (account_number, bank_code) => {
    const apiUrl = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;

    try {
        const { data } = await axios.get(apiUrl);
        if (data.status) {
            const { account_number, account_name } = data.data || {};
            return { account_name, account_number };
        } else throw new Error("Account number verification failed.");
    } catch (error) {
        const errResponse = error.response;
        const requestErrorMsg = errResponse ? errResponse?.data?.message : error?.message;
        throw new Error(requestErrorMsg);
    }
};

