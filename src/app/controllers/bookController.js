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
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
/*
exports.getchallenge = async function (req, res) {
  try {
    const goalId = req.query.goalId;
    const getchallenge1Rows = await challengeDao.getchallenge1(goalId);

    var goalBookId = 0;
    var getchallenge2Rows = [];
    for (var i = 0; i < getchallenge1Rows[0].amount; i++) {
      goalBookId = getchallenge1Rows[i].goalBookId;

      const goalBookRows = await challengeDao.getchallenge2(goalBookId);

      getchallenge2Rows.push(goalBookRows);
    }

    const getchallenge3Rows = await challengeDao.getchallenge3(goalId);

    if (getchallenge1Rows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "오늘의 챌린지 조회 성공",
        getchallenge1Rows,
        getchallenge2Rows,
        getchallenge3Rows,
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "오늘의 챌린지 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
*/
