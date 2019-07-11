const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upLoady = multer({
    storage: storage,
    limits:{
        fileSize: 1024 * 1024 *5
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get("/", (req, res, next) => {
    Product.find()
      .exec()
      .then(docs => {
        console.log(docs);
        res.status(200).json(docs);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
  

router.post('/',upLoady.single('Imager'),(req, res, next) =>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        votes: req.body.votes,
        productImage: req.file.path
    });
    product
    .save()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
      .exec()
      .then(doc => {
        console.log("From database", doc);
        if (doc) {
          res.status(200).json(doc);
        } else {
          res
            .status(404)
            .json({ message: "No valid entry found for provided ID" });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
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
    Product.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted',
            url: 'http://localhost:3000/products',
            body: {
                name: "String",
                description: "String",
                votes: "Number",
                productImage: "JPEG/PNG File"
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

router.route('/upvote/:productId').put(function (req, res) {

    Product.findById(req.params.productId, function (err, prod) {
        if (err) {
            res.send(err);
        }
        prod.votes = prod.votes + 1;
        prod.save(function (err) {
            if (err)
                res.send(err);

            res.json(prod);
        });

    });
});

router.route('/:productId').put(function (req, res) {

    Product.findById(req.params.productId, function (err, prod) {
        if (err) {
            res.send(err);
        }
        prod.name = req.body.name;
        prod.description = req.body.description;
        prod.save(function (err) {
            if (err)
                res.send(err);

            res.json(prod);
        });

    });
});

module.exports = router;