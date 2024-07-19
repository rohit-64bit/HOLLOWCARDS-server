const express = require('express');
const errorLoger = require('../utils/errorLoger');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const verifyUser = require('../middlewares/VerifyUser');
const jwt = require('jsonwebtoken');


router.post('/signup', async (req, res) => {

    try {

        const { email, password, name, address, phone } = req.body;

        if (!email || !password || !name || !address || !phone) {

            return res.status(400).json({
                message: 'Please enter all fields'
            });

        }

        const salt = bcrypt.genSaltSync(10);
        const secPass = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
            email,
            password: secPass,
            name,
            address,
            phone
        });

        res.json({
            success: true,
            message: 'Login Now'
        });

    } catch (error) {

        errorLoger(error, res);

    }

})

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: 'Please enter all fields'
            });

        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }

        const token = await user.generateAuthToken();

        res.json({
            success: true,
            message: 'Login Success',
            token
        })

    } catch (error) {

        errorLoger(error, res);

    }

})

router.get('/profile', verifyUser, async (req, res) => {

    try {

        res.json(req.user);

    } catch (error) {

        errorLoger(error, res);

    }

})

router.post('/update', verifyUser, async (req, res) => {

    try {

        const user = req.user;

        const { password, name, address, phone } = req.body;

        if (password) {
            const salt = bcrypt.genSaltSync(10);
            const secPass = bcrypt.hashSync(password, salt);
            user.password = secPass;
        }

        if (name) {
            user.name = name;
        }

        if (address) {
            user.address = address;
        }

        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile Updated'
        });

    } catch (error) {
        errorLoger(error, res);
    }

})

router.post('/admin-login', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: 'Please enter all fields'
            });

        }

        const data = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        }

        const tokenData = {
            access: process.env.ADMIN_ACCESS_CODE
        }

        if (email !== data.email || password !== data.password) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: 'Login Success',
            token
        })

    } catch (error) {

        errorLoger(error, res);

    }

})

module.exports = router;