const mongoose = require('mongoose');

var cartSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
    books: [
        {
            bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true })
module.exports =  new mongoose.model('cart', cartSchema)
