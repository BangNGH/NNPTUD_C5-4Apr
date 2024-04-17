const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    orderItems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        require: true
    }],
    shippingAddress: {
        type: String,
        require: true
    },
    phone: {
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
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require: true
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