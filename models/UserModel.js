const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    phoneNumber: {type: String, unique: true, required: true},
    passcodeHash: {type: String, required: true},
    avatar: {type: String},
    role: {type: String, enum: ['user', 'admin', 'superadmin'], default: 'user'},

    emailIsVerified: {type: Boolean, default: false},
    phoneIsVerified: {type: Boolean, default: false},
    status: {type: String, enum: ['active', 'disabled', 'deleted'], default: 'active'}
}, {timestamps: true});

const UserModel = model('Users', UserSchema);
module.exports = UserModel;