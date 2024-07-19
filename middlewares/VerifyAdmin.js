const errorLoger = require("../utils/errorLoger");
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {

    try {

        const token = req.header('admin-token');

        if (!token) {
            return res.status(401).json({
                step: 0,
                success: false,
                message: 'Unauthorized'
            });
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);

        if (data.access !== process.env.ADMIN_ACCESS_CODE) {
            return res.status(401).json({
                step: 1,
                success: false,
                message: 'Unauthorized'
            });
        }

        next();

    } catch (error) {

        errorLoger(error, res);

    }

}

module.exports = verifyAdmin;