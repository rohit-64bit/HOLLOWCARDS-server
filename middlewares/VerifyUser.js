const User = require("../models/User");
const errorLoger = require("../utils/errorLoger");
const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next) => {

    try {

        const token = req.header('x-auth-token');

        if (!token) {

            return res.status(401).json({
                message: 'No token, authorization denied'
            });

        }

        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(verifiedUser.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'No user found'
            });
        }

        req.user = user;

        next();

    } catch (error) {

        errorLoger(error, res);

    }

}

module.exports = verifyUser;