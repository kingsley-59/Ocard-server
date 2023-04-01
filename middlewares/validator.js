const Joi = require('joi');
const JoiWithPhone = Joi.extend(require('joi-phone-number'));


exports.RegisterSchema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    passcode: Joi.string().max(6).required(),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    })
});

exports.LoginSchema = Joi.object({
    email: Joi.string(),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    }),
    passcode: Joi.string().max(6).required()
});

exports.OTPGenerateSchema = Joi.object({
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    })
});

exports.CreatePinSchema = Joi.object({
    pin: Joi.string().min(4).max(4).required(),
    retryPin: Joi.ref('pin')
});

exports.ChangePinSchema = Joi.object({
    oldPin: Joi.string().min(4).max(4).required(),
    newPin: Joi.string().min(4).max(4).required(),
    retryNewPin: Joi.ref('newPin')
});

exports.transferSchema = Joi.object({
    account_name: Joi.string().min(3).required(),
    account_number: Joi.string().min(10).max(10).required(),
    bank_code: Joi.string().min(3).max(3).required(),
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
    authorization_code: Joi.string().required()
});