const mongoose = require('mongoose');

var bookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    year: Number,
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'author'
    }
    ,
    price : {
        type: Number,
        default:0
    },
    description: String,
    isDeleted:{
        type:Boolean,
        default:false
    },
    imageURL: String
}, { timestamps: true })
module.exports = new mongoose.model('book', bookSchema)