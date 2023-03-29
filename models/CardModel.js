const { Schema, model } = require("mongoose");


const CardSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },

    email: { type: String },
    authorization_code: { type: String, required: true }, //This is the code that is used to charge the card subsequently
    card_type: { type: String },                          // This tells you the card brand - Visa, Mastercard, etc
    last4: { type: String },                              // The last 4 digits of the card. This is one of the details you can use to help the user identify the card
    exp_month: { type: String },                          // The expiry month of the card in digits. Eg. "01" means January
    exp_year: { type: String },                           // The expiry year of the card
    bin: { type: String },                                // The first 6 digits of the card. This and the last 4 digits constitute the masked pan
    bank: { type: String },                               // The customer's bank, the bank that issued the card
    channel: { type: String },                            // What payment channel this is. In this case, it is a card payment
    signature: { type: String, unique: true },            // A unique identifier for the card being used. While new authorization codes are created each time a card is used, the card's signature will remain the same.
    reusable: { type: Boolean, default: true },           // A boolean flag that tells you if an authorization can be used for a recurring charge. You should only attempt to use the authorization_code if this flag returns as true.
    country_code: { type: String },
}, { timestamps: true });

const CardModel = model('Cards', CardSchema);
module.exports = CardModel;