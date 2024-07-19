const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({

    status: {
        type: String,
        default: 'pending',
        required: true,
        enum: ['pending', 'processing', 'completed', 'cancelled']
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'user',
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
    }],
    totalPrice: {
        type: Number,
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
    paymentRecord: {
        sessionID: {
            type: String
        },
        paymentString: {
            type: String,
        },
        payerID: {
            type: String,
        }
    }

})

module.exports = mongoose.model('order', OrderSchema);