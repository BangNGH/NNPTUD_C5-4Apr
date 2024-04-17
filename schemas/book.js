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
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })
module.exports = new mongoose.model('book', bookSchema)