module.exports = function (res,success,data) {
    if(success){
        res.status(200).send({
            success: true,
            data: data
        });
    }else{
        res.status(404).send({
            success: false,
            data: data
        });
    }
}