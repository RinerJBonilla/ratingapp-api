const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/',(req, res, next) =>{
    Product.find()
    .select('name description votes _id')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    description: doc.description,
                    votes: doc.votes,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+ doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/',(req, res, next) =>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        votes: req.body.votes
    });
    product
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'SUCCESS',
            createdProduct: {
                name: result.name,
                description: result.description,
                votes: result.votes,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
});

router.get('/:productId',(req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name description votes _id')
    .exec()
    .then(doc => {
        console.log("From DB",doc);
        if (doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    descrip: 'get them all',
                    url: 'http://localhost:3000/products'
                }
            });
        } else{
            res.status(404).json({message: 'Not a Valid Entry'})
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.patch('/:productId',(req, res, next) =>{
    const id = req.params.productId;
    const updater = {};
    for (const opi of req.body){
        updater[opi.propName] = opi.value;
    }
    Product.update({_id: id},{$set: updater}).exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:productId',(req, res, next) =>{
    const id = req.params.productId;
    Produc.remove({_id: id}).exe()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted',
            url: 'http://localhost:3000/products',
            body: {
                name: "String",
                description: "String",
                votes: "Number"
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;