const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const challengeDao = require("../dao/challengeDao");
const userDao = require("../dao/userDao");
const moment = require("moment");

exports.postchallenge = async function (req, res) {
  // period 값 DMY를 받으면 만료일 계산해서 DB에 저장하기
  try {
    var jwt = req.verifiedToken.id;

    if (jwt === undefined) {
      return res.json({
        result: req.verifiedToken,
      });
    }
    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { period, amount, time } = req.body;

    if (period.length === 0 || amount === 0 || time === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    if (period === "D") {
      var addexpriodAt = moment().add(7, "d");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else if (period === "M") {
      var addexpriodAt = moment().add(1, "M");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else if (period === "Y") {
      var addexpriodAt = moment().add(1, "Y");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else
      return res.json({
        isSuccess: false,
        code: 2101,
        message: "기간 입력이 잘못되었습니다.",
      });
    // 겹치는 날짜 확인
    const calendarYNRows = await challengeDao.calendarYN(jwt, expriodAt);
    if (calendarYNRows)
      return res.json({
        isSuccess: false,
        code: 2122,
        message: "해당 날짜에 이미 달성할 목표가 있습니다.",
      });
    const postchallengeRows = await challengeDao.postchallenge(
      jwt,
      period,
      amount,
      time,
      expriodAt
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
//챌린지 변경
exports.patchchallenge = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { goalId, period, amount, time } = req.body;

    if (period.length === 0 || amount === 0 || time === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    if (period === "D") {
      var addexpriodAt = moment().add(7, "d");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else if (period === "M") {
      var addexpriodAt = moment().add(1, "M");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else if (period === "Y") {
      var addexpriodAt = moment().add(1, "Y");
      var expriodAt = addexpriodAt.format("YYYY-MM-DD HH:mm:ss");
    } else
      return res.json({
        isSuccess: false,
        code: 2101,
        message: "기간 입력이 잘못되었습니다.",
      });

    const postchallengeRows = await challengeDao.patchchallenge(
      goalId,
      period,
      amount,
      time,
      expriodAt
    );

    if (postchallengeRows.changedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "목표 변경 성공",
      });
    } else if (postchallengeRows.changedRows === 0)
      return res.json({
        isSuccess: false,
        code: 2120,
        message: "목표가 변경되지 않았습니다.",
      });
    else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "목표 변경 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.postchallengeBook = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { publishNumber, goalId } = req.body;

    if (goalId.length === 0 || publishNumber.length === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const getgoalbookRows = await challengeDao.getgoalbook(
      publishNumber,
      goalId
    );
    if (!getgoalbookRows) {
      return res.json({
        isSuccess: false,
        code: 2110,
        message: "이미 챌린지에 같은 책이 있습니다.",
      });
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
//챌린지 조회
exports.getchallenge = async function (req, res) {
  // period 값 DMY를 받으면 만료일 계산해서 DB에 저장하기
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

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

//챌린지 책변경
exports.patchchallengeBook = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { publishNumber, goalBookId, goalId } = req.body;

    if (
      goalId.length === 0 ||
      goalId === undefined ||
      publishNumber.length === 0 ||
      publishNumber === undefined ||
      goalBookId.length === 0 ||
      goalBookId === undefined
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });
    const selectGoalUser = await challengeDao.selectGoalUser(goalBookId, jwt);
    if (!selectGoalUser)
      return res.json({
        isSuccess: false,
        code: 2200,
        message: "삭제할 수 있는 권한이 없습니다.",
      });

    const getgoalbookRows = await challengeDao.getgoalbook(
      publishNumber,
      goalId
    );
    if (!getgoalbookRows) {
      return res.json({
        isSuccess: false,
        code: 2110,
        message: "이미 챌린지에 같은 책이 있습니다.",
      });
    }
    const postchallengebookRows = await challengeDao.patchchallengeBook(
      publishNumber,
      goalBookId
    );

    console.log(postchallengebookRows);
    if (postchallengebookRows.changedRows === 1)
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "챌린지 책 변경 성공",
      });
    else
      return res.json({
        isSuccess: false,
        code: 2111,
        message: "이미 챌린지 중인 책입니다. 다시선택해주세요",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//챌린지 책삭제
exports.deletechallengeBook = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const { goalBookId } = req.body;

    if (goalBookId.length === 0 || goalBookId === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const selectGoalUser = await challengeDao.goalBookId(goalBookId, jwt);
    if (!selectGoalUser)
      return res.json({
        isSuccess: false,
        code: 2200,
        message: "삭제할 수 있는 권한이 없습니다.",
      });

    const deletechallengeBook = await challengeDao.deletechallengeBook(
      goalBookId
    );

    if (deletechallengeBook.affectedRows === 1)
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "챌린지 책 삭제 성공",
      });
    else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "챌린지 책 삭제 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
