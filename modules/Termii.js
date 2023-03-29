const { default: axios } = require("axios");


exports.sendOtpWithTermii = async function(phoneNumber) {
    const apiUrl = process.env.TERMII_API_URL + '/sms/otp/send';
    const payload = {
        api_key: process.env.TERMII_API_KEY,
        message_type: 'NUMERIC',
        to: phoneNumber,
        from: process.env.TERMII_SENDER_ID,
        channel: 'generic',
        pin_attempts: 10,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: '< 1234 >',
        message_text: `Your ${process.env.BANK_NAME} OTP code is < 1234 >. Valid for 10 minutes, one-time use only.`,
        pin_type: 'NUMERIC'
    };
    const { data } = await axios.post(apiUrl, payload);
    const { pinId, to, smsStatus } = data;
    console.log(data);
    if (smsStatus === "Message Sent") return { pinId, to, smsStatus };
    else return false;
};

exports.verifyOtpWithTermii = async function(pin, clientPinId) {
    const apiUrl = process.env.TERMII_API_URL + '/sms/otp/verify';
    const payload = {
        api_key: process.env.TERMII_API_KEY,
        pin_id: clientPinId,
        pin
    };
    const { data } = await axios.post(apiUrl, payload);
    console.log(data);
    const { pinId, verified, msisdn } = data;
    if (verified) return { pinId, verified, msisdn };
    else return false;
};