var express = require('express');
var router = express.Router();
var bookModel = require('../schemas/book')
require('express-async-errors')
const app = express();
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post('/api/upload', upload.single('img'), async function (req, res, next){
  res.json(req.file.path);
})

router.get('/', async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 5;
  let page = req.query.page ? req.query.page : 1;
  var queries = {};
  var exclude = ["sort", "page", "limit"];
  var stringFilter = ["name", "author"];
  var numberFilter = ["year"];
  //{ page: '1', limit: '5', name: 'Hac,Ly', author: 'Cao' }
  for (const [key, value] of Object.entries(req.query)) {
    if (!exclude.includes(key)) {
      if (stringFilter.includes(key)) {
        queries[key] = new RegExp(value.replace(',', '|'), 'i');
      } else {
        if (numberFilter.includes(key)) {
          let string = JSON.stringify(value);
          let index = string.search(new RegExp('lte|gte|lt|gt', 'i'));
          if (index < 0) {
            queries[key] = value;
          } else {
            queries[key] = JSON.parse(string.slice(0, index) + "$" 
            + string.slice(2, string.length));
          }
        }
      }
    }
  }
  queries.isDeleted = false;
  books = await bookModel.find(queries)
    .populate({ path: 'author', select: "_id name" }).lean()
    .skip((page - 1) * limit).limit(limit).exec();
  res.status(200).send(books);
});
router.get('/:id', async function (req, res, next) {
  var book = await bookModel.findById(req.params.id).populate({ path: 'author', select: "_id name" }).exec();
  console.log(book);

  res.status(200).send(book);

});

router.post('/', upload.single('img'), async function (req, res, next) {
  try {
    let newBook = new bookModel({
      name: req.body.name,
      year: req.body.year,
      author: req.body.author,
      price: req.body.price,
      description: req.body.description,
      imageURL: req.file.path
    });
    await newBook.save();
    res.status(200).send(newBook);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    var book = await bookModel.findByIdAndUpdate(req.params.id, req.body,
      {
        new: true
      }).exec();
    res.status(200).send(book);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.delete('/:id', async function (req, res, next) {
  try {
    var book = await bookModel.findByIdAndUpdate(req.params.id, {
      isDeleted: true
    },
      {
        new: true
      }).exec();
    res.status(200).send(book);
  } catch (error) {
    res.status(404).send(error);
  }
});
module.exports = router;
