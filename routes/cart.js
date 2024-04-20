var express = require("express");
var router = express.Router();
var protect = require("../middlewares/protect");
var CartItem = require("../schemas/cart");
router.use(express.json());
router.post("/add-to-cart", protect, async (req, res) => {
  const userId = req.user._id;
  const bookId = req.body.bookId;
  try {
    let cart = await CartItem.findOne({ userId: userId });

    if (!cart) {
      cart = await CartItem.create({
        userId: userId,
        books: [{ bookId: bookId, quantity: 1 }],
      });
    } else {
      let existingProduct = cart.books.find(
        (item) => String(item.bookId) === String(bookId)
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.books.push({ bookId: bookId, quantity: 1 });
      }
      await cart.save();
    }

    res.status(200).send("Sản phẩm đã được thêm vào giỏ hàng.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.");
  }
});
router.post("/update-cart", protect, async (req, res) => {
  const userId = req.user._id;
  const updateBooksData = req.body.books; 
  console.log(updateBooksData);
  try {
    let cart = await CartItem.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).send("Không tìm thấy giỏ hàng.");
    }

    updateBooksData.forEach(async (updateData) => {
      const { bookId, quantity } = updateData;

      const existingProduct = cart.books.find(
        (item) => String(item.bookId) === String(bookId)
      );

      if (existingProduct) {
        existingProduct.quantity = quantity;
      } 
    });

    await cart.save();

    res.status(200).send("Sửa số lượng thành công.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.");
  }
});

router.get("/", protect, async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await CartItem.findOne({ userId: userId }).populate(
      "books.bookId"
    );
    if (!cart) {
      return res.status(404).send("Không tìm thấy giỏ hàng.");
    }
    res.status(200).json(cart.books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi khi lấy thông tin giỏ hàng.");
  }
});

router.delete("/delete-item/:id", protect, async (req, res) => {
  const userId = req.user._id;
  const itemId = req.params.id;
  try {
    let cart = await CartItem.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).send("Không tìm thấy giỏ hàng.");
    }

    // Tìm và xoá mục có ID tương ứng ra khỏi giỏ hàng
    cart.books = cart.books.filter(
      (item) => item.bookId.toString() !== itemId.toString()
    );
    await cart.save();

    res.status(200).send("Đã xoá mục khỏi giỏ hàng.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi khi xoá mục khỏi giỏ hàng.");
  }
});

module.exports = router;
