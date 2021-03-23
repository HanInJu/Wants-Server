const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const bookDao = require("../dao/bookDao");
const challengeDao = require("../dao/challengeDao");

exports.postbook = async function (req, res) {
  try {
    const {
      writer,
      publishDate,
      publishNumber,
      contents,
      imageURL,
      title,
      publisher,
    } = req.body;

    if (
      writer.length === 0 ||
      publishDate.length === 0 ||
      publishNumber.length === 0 ||
      title.length === 0 ||
      publisher.length === 0
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const publishDate1 = publishDate.substring(0, 10);

    const getbookRows = await challengeDao.getbook(publishNumber);

    if (getbookRows.length <= 0) {
      const bookRows = await bookDao.postbook(
        writer,
        publishDate1,
        publishNumber,
        contents,
        imageURL,
        title,
        publisher
      );
      if (bookRows.affectedRows === 1) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "책 추가 성공",
          bookId: bookRows.insertId,
        });
      } else
        return res.json({
          isSuccess: false,
          code: 4000,
          message: "책 추가 실패",
        });
    } else
      return res.json({
        isSuccess: false,
        code: 2110,
        message: "책이 이미 있습니다.",
        bookId: getbookRows[0].bookId,
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getbook = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const getbookRows = await bookDao.getbook(bookId);
    const currentReadRows = await bookDao.currentRead(bookId);

    if (getbookRows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "책 조회 성공",
        getbookRows,
        currentReadRows,
      });
    } else if (getbookRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2231,
        message: "책이 없습니다. 추가해주세요",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "책 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
