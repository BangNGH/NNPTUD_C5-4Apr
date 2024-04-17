var express = require("express");
var router = express.Router();
const { Order } = require("../schemas/order");
const { OrderItem } = require("../schemas/order-item");

router.get("/", async function (req, res) {
  var queries = {};
  queries.isDeleted = false;
  const orderList = await Order.find(queries).populate('user', 'username').sort('createdAt');

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

router.get("/:id", async function (req, res) {
  const order = await Order.findById(req.params.id).populate('user', 'username').populate({path: 'orderItems', populate:'book'});
  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  try {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItems = new OrderItem({
          quantity: orderItem.quantity,
          book: orderItem.book,
        });
        newOrderItems = await newOrderItems.save();
        return newOrderItems._id;
      })
    );

    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
      const orderItem = await OrderItem.findById(orderItemId).populate('book', 'price')
      const totalPrice = orderItem.book.price*orderItem.quantity;
      return totalPrice;
    }))
    console.log(totalPrices);
    const totalPrice = totalPrices.reduce((a, b)=>a+b, 0)

    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress: req.body.shippingAddress,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    await order.save();
    res.status(200).send(order);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    var order = await Order.findByIdAndUpdate(req.params.id,
      {
        status: req.body.status
      }
      ,{
        new: true
      }).exec();
    res.status(200).send(order);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete('/:id', async function (req, res) {
  try {
    var order = await Order.findByIdAndUpdate(req.params.id, {
      isDeleted: true
    },
      {
        new: true
      }).exec();
    res.status(200).send(order);
  } catch (error) {
    res.status(404).send(error);
  }
});

// router.get("/count", async (req, res) =>{
//   const orderCount = await Order.countDocuments((count)=>count)
//   if(!orderCount){
//     return res.status(500).json({success:false});
//   }
//   res.send({orderCount: orderCount});
// });

// router.get("/toalsales", async (req, res) =>{
//   const totalSales = await Order.aggregate([
//     {$group:{_id:null, totalsales:{$sum:'$totalPrice'}}}
//   ])
//   if(!totalSales){
//     return res.send.status(400).send('The order sales cannot be generated');
//   }
//   res.send({totalsales: totalSales.pop().totalSales});
// });

router.get("/user/:userid", async (req, res) =>{
  const orderList = await Order.find({user: req.params.userid}).populate({path: 'orderItems', populate:'book'}).sort('createdAt');

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

module.exports = router;
