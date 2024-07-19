const express = require('express');
const connectDB = require('./config/db');
const app = express();
const cors = require('cors');

require('dotenv').config({
    path: './config/.env'
});

const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});