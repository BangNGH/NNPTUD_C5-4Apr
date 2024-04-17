const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
    books: [
        {
            bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
            quantity: { type: Number, default: 1 }
        }
    ],
    shippingAddress: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
   
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
orderSchema.set('toJSON',{
    virtuals: true,
})


exports.Order = mongoose.model('order', orderSchema);