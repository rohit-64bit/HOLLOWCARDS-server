const errorLoger = (error, res) => {

    console.log({
        messsage: error.message,
        error: error.stack
    });

    res.status(500).json({
        error: 'Internal Server Error'
    });

}

module.exports = errorLoger;