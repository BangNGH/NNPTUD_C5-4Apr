const mongoose = require('mongoose');
const orderItemsSchema = mongoose.Schema({
    quantity:{
        type: Number,
        required: true
    },
    book:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book'
    }
}, { timestamps: true })
exports.OrderItem = mongoose.model('OrderItem', orderItemsSchema);