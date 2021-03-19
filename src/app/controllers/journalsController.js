const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reviewDao = require("../dao/reviewDao");
const journalsDao = require("../dao/journalsDao");
const userDao = require("../dao/userDao");

/*
 * API 기 능 : 일지 추가
 */
exports.patchjournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { text, journalImageURL, open, page, percent } = req.body;

    if (
      time.length === 0 ||
      time === undefined ||
      text.length === 0 ||
      text === undefined ||
      open.length === 0 ||
      open === undefined ||
      page.length === 0 ||
      page === undefined ||
      percent.length === 0 ||
      percent === undefined ||
      goalBookId.length === 0 ||
      goalBookId === undefined
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });
    console.log(goalBookId);
    const whatIsYourName = await reviewDao.whatIsYourName(jwt);
    if (whatIsYourName[0].name === "Reader") {
      return res.json({
        isSuccess: false,
        code: 3001,
        message: "닉네임을 설정해주세요.",
      });
    }

    const goalId1 = await reviewDao.getgoalBookId(goalBookId);
    const goalId = goalId1[0].GoalId;

    if (goalId.length == 0)
      return res.json({
        isSuccess: true,
        code: 2225,
        message: "읽은 책이 없습니다.",
      });

    const postjournalsRows = await reviewDao.postjournals(
      time,
      page,
      percent,
      goalBookId,
      goalId,
      jwt
    );

    if (postjournalsRows.affectedRows === 1) {
      const challengeId = postjournalsRows.insertId;
      const postjournals2Rows = await reviewDao.postjournals2(
        challengeId,
        text,
        journalImageURL,
        open
      );
      if (postjournals2Rows.affectedRows === 1)
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "일지 작성 성공",
        });
      else if (postjournals2Rows.affectedRows === 0)
        return res.json({
          isSuccess: true,
          code: 4000,
          message: "일지 작성 실패",
        });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "일지 작성 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//일지수정
exports.postjournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const {
      time,
      text,
      journalImageURL,
      open,
      goalBookId,
      page,
      percent,
    } = req.body;

    if (
      time.length === 0 ||
      time === undefined ||
      text.length === 0 ||
      text === undefined ||
      open.length === 0 ||
      open === undefined ||
      page.length === 0 ||
      page === undefined ||
      percent.length === 0 ||
      percent === undefined ||
      goalBookId.length === 0 ||
      goalBookId === undefined
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });
    console.log(goalBookId);
    const whatIsYourName = await reviewDao.whatIsYourName(jwt);
    if (whatIsYourName[0].name === "Reader") {
      return res.json({
        isSuccess: false,
        code: 3001,
        message: "닉네임을 설정해주세요.",
      });
    }

    const goalId1 = await reviewDao.getgoalBookId(goalBookId);
    const goalId = goalId1[0].GoalId;

    if (goalId.length == 0)
      return res.json({
        isSuccess: true,
        code: 2225,
        message: "읽은 책이 없습니다.",
      });

    const postjournalsRows = await reviewDao.postjournals(
      time,
      page,
      percent,
      goalBookId,
      goalId,
      jwt
    );

    if (postjournalsRows.affectedRows === 1) {
      const challengeId = postjournalsRows.insertId;
      const postjournals2Rows = await reviewDao.postjournals2(
        challengeId,
        text,
        journalImageURL,
        open
      );
      if (postjournals2Rows.affectedRows === 1)
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "일지 작성 성공",
        });
      else if (postjournals2Rows.affectedRows === 0)
        return res.json({
          isSuccess: true,
          code: 4000,
          message: "일지 작성 실패",
        });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "일지 작성 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
