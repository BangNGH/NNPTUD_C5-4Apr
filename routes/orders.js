var express = require("express");
var router = express.Router();
const { Order } = require("../schemas/order");
const { OrderItem } = require("../schemas/cart");
var protect = require("../middlewares/protect");
var CartItem = require('../schemas/cart')
router.get("/", async function (req, res) {
  var queries = {};
  queries.isDeleted = false;
  const orderList = await Order.find(queries).populate('user', 'username').sort('createdAt');

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

router.get("/:id", protect, async function (req, res) {
  const order = await Order.findById(req.params.id).populate('user', 'username').populate({path: 'orderItems', populate:'book'});
  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post('/create-order', protect, async (req, res) => {
  try {
      const order = await Order.create({ 
        userId: req.user._id, 
        books: req.body.books,
        shippingAddress: req.body.address,
        phone: req.body.phone,
        name: req.body.name,
        totalPrice: req.body.totalPrice
      });
        // Xoá các món hàng đã đặt từ giỏ hàng
      await CartItem.updateOne({ userId: req.user._id }, { $pull: { books: { bookId: { $in: req.body.books.map(item => item.bookId) } } } });
      res.status(201).json(order);
  } catch (error) {
      console.error(error);
      res.status(500).send('Đã xảy ra lỗi khi tạo đơn hàng.');
  }
});

router.get('/orders/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      const orders = await Order.find({ userId: userId }).populate('books.bookId');
      res.status(200).json(orders);
  } catch (error) {
      console.error(error);
      res.status(500).send('Đã xảy ra lỗi khi lấy danh sách đơn hàng.');
  }
});

router.put('/:id', protect, async function (req, res, next) {
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

router.delete('/:id', protect, async function (req, res) {
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

router.get("/user/:userid", protect, async (req, res) =>{
  const orderList = await Order.find({user: req.params.userid}).populate({path: 'orderItems', populate:'book'}).sort('createdAt');

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

module.exports = router;
