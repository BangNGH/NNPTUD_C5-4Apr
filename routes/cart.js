var express = require('express');
var router = express.Router();


router.post('/add-to-cart', (req, res) => {
    const bookId = req.body.bookId; // Lấy ID sản phẩm từ yêu cầu
    if (!req.session.cart) {
        req.session.cart = [];
    }
    let existingItemIndex = req.session.cart.findIndex(item => item.bookId === bookId);
    if (existingItemIndex !== -1) {
        req.session.cart[existingItemIndex].quantity += 1;
    } else {
        req.session.cart.push({ bookId: bookId, quantity: 1 });
    }
    res.status(200).send('Sản phẩm đã được thêm vào giỏ hàng.');
});

router.get('/', (req, res) => {
    const cartItems = req.session.cart || []; 
    res.status(200).json({ items: cartItems });
});

router.get('/clear', (req, res) => {
    req.session.cart = [];
    res.status(200).send('Giỏ hàng đã được xoá.');
});

module.exports = router;