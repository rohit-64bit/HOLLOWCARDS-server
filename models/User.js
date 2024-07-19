const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    cart: [{
        productID: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            required: true
        }
    }]

}, {
    timestamps: true
})

UserSchema.methods.generateAuthToken = async function () {

    const token = jwt.sign({
        id: this.id
    }, process.env.JWT_SECRET);

    return token;

}

module.exports = mongoose.model('user', UserSchema);