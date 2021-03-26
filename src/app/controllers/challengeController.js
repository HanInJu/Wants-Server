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

    if (calendarYNRows.length > 0)
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
        goalId: postchallengeRows.insertId,
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

    const getbookRows = await challengeDao.getbook(publishNumber);
    if (getbookRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2111,
        message: "책을 추가하고 챌린지에 책을 입력해주세요.",
      });
    }
    const getgoalbookRows = await challengeDao.getgoalbook(
      publishNumber,
      goalId
    );
    if (getgoalbookRows.length > 0) {
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

    // goalId 찾기 유저 jwt로
    const goalIdRows = await challengeDao.getgoalId(jwt);
    var isExpired = false;
    var goalId = 0;

    if (goalIdRows.length === 0 || goalIdRows === undefined) {
      const goalId2Rows = await challengeDao.getgoalId2(jwt);

      goalId = goalId2Rows[0].goalId;

      isExpired = true;
    } else goalId = goalIdRows[0].goalId;

    const getchallenge1Rows = await challengeDao.getchallenge1(goalId);
    const getchallenge3Rows = await challengeDao.getchallenge3(goalId);

    if (getchallenge1Rows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2223,
        message: "도전한 챌린지가 없습니다.",
        getchallenge3Rows,
        isExpired,
      });
    }

    var goalBookId = 0;
    var getchallenge2Rows = [];

    for (var i = 0; i < getchallenge3Rows[0].amount; i++) {
      goalBookId = getchallenge1Rows[i].goalBookId;
      const goalBookRows = await challengeDao.getchallenge2(goalBookId);
      getchallenge2Rows.push(goalBookRows);
    }

    if (getchallenge1Rows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "오늘의 챌린지 조회 성공",
        getchallenge1Rows,
        getchallenge2Rows,
        getchallenge3Rows,
        isExpired,
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

//책관리조회
exports.getgoalBook = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const goalIdRows = await challengeDao.getgoalId(jwt);
    if (goalIdRows.length === 0)
      return res.json({
        isSuccess: false,
        code: 2221,
        message:
          "목표를 먼저 설정해주세요. 목표를 추가해야 책 설정이 가능합니다.",
      });

    const goalId = goalIdRows[0].goalId;
    console.log(goalId);
    const getbookListRows = await challengeDao.getbookList(goalId);
    if (getbookListRows.length > 0)
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "도전책 조회 성공",
        getbookListRows,
      });
    else if (getbookListRows.length === 0)
      return res.json({
        isSuccess: false,
        code: 2222,
        message: "도전중인 책이 없습니다. 책을 추가해주세요.",
      });
    else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "도전책 조회 실패",
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
    const deletechallengeBook2 = await challengeDao.deletechallengeBook2(
      goalBookId
    );
    if (deletechallengeBook2.affectedRows === 1)
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

//오늘 읽은 책 총 시간
exports.getbookTime = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const goalBookId = req.params.goalBookId;

    if (goalBookId.length === 0 || goalBookId === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const getbookTimeRows = await challengeDao.getbookTime(goalBookId);

    if (getbookTimeRows.length > 0 || getbookTimeRows === undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "시간 조회 성공",
        result: getbookTimeRows,
      });
    } else if (getbookTimeRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "불러올 시간이 없습니다. 책 읽어주세요.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "시간 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//챌린지 현황
exports.getgoal = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const goalId = req.params.goalId;

    if (goalId.length === 0 || goalId === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const getcontinuityRows = await challengeDao.getcontinuity(goalId);
    const getcontinuity2Rows = await challengeDao.getcontinuity2(goalId);

    if (getcontinuityRows.length > 0 && getcontinuity2Rows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "시간 조회 성공",
        getcontinuityRows,
        getcontinuity2Rows,
      });
    } else if (
      getcontinuityRows.length === 0 ||
      getcontinuity2Rows.length === 0
    ) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "인증할 내용이 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "시간 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 도전할 책 설정
exports.patchgoalBook = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const goalbookId = req.params.goalbookId;

    if (goalbookId.length === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const getgoalBookIdRows = await challengeDao.getgoalBookId(goalbookId); // 기존에 도전중이였던 목표책 인덱스 부름
    if (getgoalBookIdRows.length > 0) {
      console.log("기존꺼 비활");
      const YgoalBookId = getgoalBookIdRows[0].goalBookId;
      await challengeDao.patchgoalBookId(YgoalBookId); // 기존에 도전중이였던 목표책 인덱스 N으로 바꿈
    }

    const patchgoalBookId2Rows = await challengeDao.patchgoalBookId2(
      goalbookId
    );

    // 비활성과 활성이 잘 되었는지, 'Y'가 도전중 한개인지 확인
    const getYNRows = await challengeDao.getYN(goalbookId);
    if (getYNRows[0].isYN === "X") {
      console.log("기존꺼 비활이 잘못됨, 새롭게 도전할 책 되돌기 N으로");
      await challengeDao.patchgoalBookId(goalbookId);
    }

    if (patchgoalBookId2Rows.changedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "도전할 책 변경 성공",
      });
    } else if (patchgoalBookId2Rows.changedRows === 0)
      return res.json({
        isSuccess: false,
        code: 2225,
        message: "도전할 책 변경이 제대로 이루어지지 않았습니다.",
      });
    else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "도전할 책 변경 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

/*
 * 최종 수정일 : 2021.03.24.WED
 * API 기 능 : 챌린지에 부여될 케이크 종류 넘겨주기
 * 담당 개발자 : Heather
 */
exports.postCake = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined) {
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });
    }

    try {
      const { goalId, cake } = req.body;

      if (
        (cake !== "choco" && cake !== "cream" && cake !== "berry") ||
        cake == null
      ) {
        return res.json({
          isSuccess: false,
          code: 2030,
          message: "케이크 종류는 초코, 크림, 베리 셋 중 하나로 입력해주세요.",
        });
      }

      const isValidGoalId = await challengeDao.isValidGoalId(goalId);
      if (isValidGoalId[0].exist === 0) {
        return res.json({
          isSuccess: false,
          code: 2029,
          message: "유효하지 않은 goalId입니다.",
        });
      }

      const isAlreadyAchieve = await challengeDao.isAchieved(goalId);

      if (isAlreadyAchieve[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2031,
          message: "이미 달성하여 케이크 종류가 부여된 챌린지입니다.",
        });
      }

      const ownerId = await challengeDao.whoIsOwner(goalId);

      if (ownerId[0].userId !== userId) {
        return res.json({
          isSuccess: false,
          code: 2032,
          message: "이 챌린지를 등록한 유저가 아닙니다.",
        });
      }

      await challengeDao.postCake(cake, goalId);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "챌린지 달성! 케이크 종류 입력 완료.",
      });
    } catch (err) {
      logger.error(
        `PostCake - non transaction Query error\n: ${JSON.stringify(err)}`
      );
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "케이크 종류 등록 실패",
      });
    }
  } catch (err) {
    logger.error(`PostCake - DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};
