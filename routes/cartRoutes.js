const express = require('express');
const router = express.Router();
const verfyUser = require('../middlewares/VerifyUser');
const errorLoger = require('../utils/errorLoger');
const verifyUser = require('../middlewares/VerifyUser');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const e = require('express');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/add', verfyUser, async (req, res) => {

    try {

        const { productID, quantity } = req.body;

        const user = req.user;

        const cart = user.cart;

        const index = cart.findIndex(item => item.productID == productID);

        if (index > -1) {

            cart[index].quantity += quantity;

        } else {

            cart.push({
                productID,
                quantity
            });

        }

        await user.save();

        res.json({
            success: true,
            message: 'Product added to cart'
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.get('/', verfyUser, async (req, res) => {

    try {

        const user = req.user;

        const cart = user.cart;

        const data = [];

        for (let i = 0; i < cart.length; i++) {

            const product = await Product.findById(cart[i].productID);

            data.push({
                productID: product._id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                description: product.description,
                image: product.image,
                quantity: cart[i].quantity
            });

        }

        res.json({
            success: true,
            data
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.post('/remove', verifyUser, async (req, res) => {
    try {
        const { productID } = req.body;

        console.log(req.body)

        const user = req.user._id;

        // Cast productID to ObjectId
        const objectIdProductID = new mongoose.Types.ObjectId(productID);

        const userProfile = await User.findById(user);

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Filter the cart items by comparing ObjectId values
        userProfile.cart = userProfile.cart.filter(item => !item.productID.equals(objectIdProductID));

        await userProfile.save();

        res.json({
            success: true,
            message: 'Product removed from cart'
        });

    } catch (error) {
        errorLoger(error, res);
    }
});

router.post('/handle-payment-session', verifyUser, async (req, res) => {

    try {

        const cartData = req.user.cart;

        const lineItems = [];

        await Promise.all(cartData.map(async element => {

            const product = await Product.findById(element.productID);

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: [product.image[0]],
                    },
                    unit_amount: Math.round(product.price * 100)
                },
                quantity: element.quantity
            });

        }));

        const totalPrice = lineItems.reduce((acc, item) => acc + item.price_data.unit_amount * item.quantity, 0);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/failed`,
            custom_fields: [
                {
                    key: 'name',
                    label: {
                        type: 'custom',
                        custom: 'Full Name',
                    },
                    type: 'text',
                    text: {
                        default_value: req.user.name
                    }
                },
                {
                    key: 'address',
                    label: {
                        type: 'custom',
                        custom: 'Shipping Address',
                    },
                    type: 'text',
                    text: {
                        default_value: req.user.address
                    }
                },
                {
                    key: 'phone',
                    label: {
                        type: 'custom',
                        custom: 'Phone Number',
                    },
                    type: 'text',
                    text: {
                        default_value: req.user.phone
                    }
                }
            ]
        });

        console.log(session)

        if (!session) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create payment'
            });
        }

        const newOrder = new Order({
            userID: req.user._id,
            cart: cartData, // This is the cart data from the user
            status: 'pending', // This is the status of the payment
            totalPrice: totalPrice, // This is the total price of the order
            address: req.user.address, // This is the address of the user
            phone: req.user.phone, // This is the phone number of the user
            paymentRecord: {
                sessionID: session.id, // This is the session ID from Stripe
                payerID: req.user.id
            }
        });

        await newOrder.save();

        res.json({
            id: session.id
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.post('/handle-payment-success', verifyUser, async (req, res) => {

    try {

        const { session_id } = req.body;

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const order = await Order.findOne({ 'paymentRecord.sessionID': session_id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = 'completed';
        order.paymentRecord.paymentString = session.payment_intent;

        await order.save();

        // Clear the cart

        req.user.cart = [];

        await req.user.save();

        const cartData = order.cart;

        await Promise.all(cartData.map(async element => {

            const product = await Product.findById(element.productID);

            product.stock -= element.quantity;

            await product.save();

        }));

        res.json({
            success: true,
            message: 'Payment successful',
            orderID: order.id
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

module.exports = router;