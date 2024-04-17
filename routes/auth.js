var express = require("express");
var router = express.Router();
var userModel = require("../schemas/user");
var ResHand = require("../helper/ResHandle");
var { validationResult } = require("express-validator");
var checkAuth = require("../validators/auth");
var bcrypt = require("bcrypt");
var protect = require("../middlewares/protect");
var sendMail = require("../helper/sendmail");
const path = require('path');
const { register } = require('module');

router.post("/changepassword", protect, async function (req, res, next) {
  if (bcrypt.compareSync(req.body.oldpassword, req.user.password)) {
    let user = req.user;
    user.password = req.body.newpassword;
    await user.save();
    ResHand(res, true, "cap nhat thanh cong");
  } else {
    ResHand(res, false, "oldpassword sai");
    return;
  }
});

router.get("/me", protect, async function (req, res, next) {
  ResHand(res, true, req.user);
});

router.post("/login", async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    ResHand(res, false, "hay nhap day du thong tin");
    return;
  }
  let user = await userModel.findOne({ username: username });
  if (!user) {
    ResHand(res, false, "username hoac password khong dung");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    let token = user.getJWT();
    res.status(200).cookie('token', token, {
      expires: new Date(Date.now() + 24 * 3600 * 1000),
      httpOnly: true
    });

    // Kiểm tra xem session đã được tạo chưa
    if (!req.session) {
      req.session = {}; // Tạo một session mới nếu không tồn tại
    }

    // Kiểm tra xem session đã có id chưa
    if (!req.session.id) {
      // Tạo một id mới cho session
      req.session.id = generateSessionId(); // Hàm generateSessionId() là hàm tạo id mới
    }

    res.status(200).send({
      success: true,
      data: token,
    });
  } else {
    ResHand(res, false, "username hoac password khong dung");
  }
});

router.get("/me", protect, async function (req, res, next) {
  ResHand(res, true, req.user);
});

router.post("/register", checkAuth(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHand(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ["USER"],
    });
    await newUser.save();
    res.status(200).send(newUser);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.post('/updateInfo', protect, async (req, res) => {
  try {
      // Lấy thông tin địa chỉ và số điện thoại từ body của request
      const { address, phone } = req.body;

      // Lấy thông tin người dùng từ token xác thực
      const userId = req.user._id;

      // Kiểm tra xem người dùng có tồn tại không
      const user = await userModel.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      // Cập nhật địa chỉ và số điện thoại cho người dùng
      user.address = address;
      user.phone = phone;

      // Lưu thông tin người dùng đã cập nhật
      await user.save();

      // Trả về thông tin người dùng đã được cập nhật thành công
      res.status(200).json({ message: 'Thông tin người dùng đã được cập nhật thành công' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng' });
  }
});



router.get("/ForgotPassword", function (req, res) {
  res.sendFile(path.join(__dirname, '../public/forgotPassword.html'));
});

router.post("/ForgotPassword", async function (req, res, next) {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).send({ message: "Emai khong ton tai" });
    return;
  }
  let token = user.genTokenResetPassword();
  await user.save();
  let url = `http://localhost:3000/auth/ResetPassword?token=${token}`;
  try {
    await sendMail(user.email, url);
    res.status(200).send({ message: "gui mail thanh cong" });
  } catch (error) {
    res.status(404).send(error);
  }
});

// Route GET để trả về trang HTML reset password với token
router.get("/resetPassword", function (req, res) {
  res.sendFile(path.join(__dirname, '../public/resetPassword.html'));
});

router.post("/ResetPassword/:token", async function (req, res, next) {
  let user = await userModel.findOne({
    ResetPasswordToken: req.params.token,
  });
  if (!user) {
    res.status(404).send("URL khong hop le");
    return;
  }
  user.password = req.body.password;
  user.ResetPasswordToken = undefined;
  user.ResetPasswordExp = undefined;
  await user.save();
  res.status(200).send({ message: "Doi pass thanh cong" });
});

module.exports = router;
