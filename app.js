const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');

mongoose.connect("mongodb://nodtest:"+process.env.MONGO_ATLAS_PW+"@cluster0-shard-00-00-rhu6a.mongodb.net:27017,cluster0-shard-00-01-rhu6a.mongodb.net:27017,cluster0-shard-00-02-rhu6a.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin");

mongoose.Promise = global.Promise;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','*');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, PATCH');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found!');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;