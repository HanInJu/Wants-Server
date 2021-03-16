const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const challengeDao = require("../dao/challengeDao");
const moment = require("moment");

exports.postchallenge = async function (req, res) {
  // period 값 DMY를 받으면 만료일 계산해서 DB에 저장하기
  try {
    /*var jwt = req.verifiedToken.id;
        
        const userRows = await userprofileDao.getuser(jwt);
        if(userRows[0] === undefined) return res.json({
            isSuccess: false,
            code: 4020,
            message: "가입되어있지 않은 유저입니다."
        });*/

    const { userId, period, amount, time } = req.body;

    if (period.length === 0 || amount === 0 || time === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });
    else if (period !== "D" && period !== "M" && period !== "Y")
      return res.json({
        isSuccess: false,
        code: 2101,
        message: "기간 입력이 잘못되었습니다.",
      });

    const postchallengeRows = await challengeDao.postchallenge(
      userId,
      period,
      amount,
      time
    );

    if (postchallengeRows.affectedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "챌린지 추가 성공",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "챌린지 추가 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.postchallengeBook = async function (req, res) {
  // period 값 DMY를 받으면 만료일 계산해서 DB에 저장하기
  try {
    /*var jwt = req.verifiedToken.id;
        
        const userRows = await userprofileDao.getuser(jwt);
        if(userRows[0] === undefined) return res.json({
            isSuccess: false,
            code: 4020,
            message: "가입되어있지 않은 유저입니다."
        });*/
    // 1. 책이 DB에 없다면 추가
    // 2. 책고유번호 챌린지 북에 넣기
    const {
      goalId,
      writer,
      publishDate,
      publishNumber,
      contents,
      imageURL,
      title,
      publisher,
    } = req.body;

    if (
      goalId.length === 0 ||
      writer.length === 0 ||
      publishDate.length === 0 ||
      publishNumber.length === 0 ||
      title.length === 0 ||
      publisher.length === 0
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력값에 NULL이 있습니다.",
      });

    const publishDate1 = publishDate.substring(0, 10);

    const getbookRows = await challengeDao.getbook(publishNumber);

    if (getbookRows.length <= 0) {
      await challengeDao.postbook(
        writer,
        publishDate1,
        publishNumber,
        contents,
        imageURL,
        title,
        publisher
      );
    }

    const postchallengebookRows = await challengeDao.postchallengeBook(
      goalId,
      publishNumber
    );

    if (postchallengebookRows.affectedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "챌린지 책 추가 성공",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "챌린지 책 추가 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getchallenge = async function (req, res) {
  // period 값 DMY를 받으면 만료일 계산해서 DB에 저장하기
  try {
    /*var jwt = req.verifiedToken.id;
        
        const userRows = await userprofileDao.getuser(jwt);
        if(userRows[0] === undefined) return res.json({
            isSuccess: false,
            code: 4020,
            message: "가입되어있지 않은 유저입니다."
        });*/

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
