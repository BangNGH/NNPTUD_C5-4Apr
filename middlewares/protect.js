var jwt = require('jsonwebtoken');
const config = require('../configs/config');
var userModel = require('../schemas/user')
var ResHand = require('../helper/ResHandle')

module.exports = async function (req, res, next) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }else{
        if(req.cookies.token){
            token = req.cookies.token;
        }
    }
    if(!token){
        ResHand(res, false, "yeu cau dang nhap");
        return;
    }
    try {
        let result = jwt.verify(token, config.JWT_SECRET_KEY);
        if (result.exp * 1000 > Date.now()) {
            var user = await userModel.findById(result.id);
            req.user = user
            next();
        } else {
            ResHand(res, false, "yeu cau dang nhap");
        }
    } catch (error) {
        ResHand(res, false, "yeu cau dang nhap");
    }
}