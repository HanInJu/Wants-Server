module.exports = function (app) {
  const book = require("../controllers/bookController");

  app.post("/book", book.postbook); // 책 추가
  app.get("/book/:bookId", book.getbook); // 책 상세 조회
};
