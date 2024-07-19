const express = require('express');
const errorLoger = require('../utils/errorLoger');
const Product = require('../models/Product');
const verifyAdmin = require('../middlewares/VerifyAdmin');
const router = express.Router();

router.get('/', async (req, res) => {

    try {

        const data = await Product.find();

        res.json({
            success: true,
            data
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.get('/:id', async (req, res) => {

    try {

        const data = await Product.findById(req.params.id);

        res.json({
            success: true,
            data
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const { name, price, stock, description, image } = req.body;

        const product = new Product({
            name,
            price,
            stock,
            description,
            image
        });

        await product.save();

        res.json({
            success: true,
            message: 'Product created'
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const { name, price, stock, description, image } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        product.name = name;
        product.price = price;
        product.stock = stock;
        product.description = description;
        product.image = image;

        await product.save();

        res.json({
            success: true,
            data: product
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

router.delete('/delete/:id', verifyAdmin, async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        await product.deleteOne();

        res.json({
            success: true,
            data: product
        });

    } catch (error) {

        errorLoger(error, res);

    }

});

module.exports = router;