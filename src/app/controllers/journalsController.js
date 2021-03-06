const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const challengeDao = require("../dao/challengeDao");
const reviewDao = require("../dao/reviewDao");
const journalsDao = require("../dao/journalsDao");
const userDao = require("../dao/userDao");
var url = require("url");
/*
 * API 기 능 : 일지 작성
 */
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
    const whatIsYourName = await reviewDao.whatIsYourName(jwt);
    if (whatIsYourName[0].name === "Reader") {
      return res.json({
        isSuccess: false,
        code: 3001,
        message: "닉네임을 설정해주세요.",
      });
    }
    const { time, text, open, goalBookId, page, percent } = req.body;

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
    else if (percent > 100)
      return res.json({
        isSuccess: false,
        code: 2227,
        message: "퍼센트는 100까지만 입력 가능합니다.",
      });

    const journalpercent = await journalsDao.journalpercent(goalBookId);

    if (journalpercent.length > 0) {
      if (journalpercent[0].percent > percent) {
        return res.json({
          isSuccess: false,
          code: 2228,
          message:
            "이전에 입력한 퍼센트보다 낮습니다. 이전에 입력한 퍼센트보다 같거나 높게 적어주세요.",
        });
      }
    }

    const timeY = parseInt(time / 60);
    const goalId1 = await journalsDao.getgoalBookId(goalBookId);

    console.log(goalId1, jwt);
    if (goalId1.length == 0)
      return res.json({
        isSuccess: true,
        code: 2225,
        message: "책이 챌린지책으로 등록되어있지 않습니다.",
      });
    else if (goalId1[0].userId !== jwt)
      return res.json({
        isSuccess: true,
        code: 2226,
        message: "목표로 등록한 책의 유저와 일지를 작성할 유저가 다릅니다.",
      });
    const goalId = goalId1[0].goalId;

    if (percent === 100) {
      await journalsDao.percentY(goalBookId);
    }

    const charPercent2 = await journalsDao.getpercent(goalBookId);
    var charPercent = 0;
    console.log(charPercent2);
    if (charPercent2.length !== 0) {
      var charPercent1 = charPercent2[0].percent;
      charPercent = percent - charPercent1;
    }
    console.log(charPercent, goalBookId, goalId, timeY);
    const postjournalsRows = await journalsDao.postjournals(
      timeY,
      page,
      percent,
      goalBookId,
      goalId,
      jwt,
      charPercent
    );

    if (postjournalsRows.affectedRows === 1) {
      const challengeId = postjournalsRows.insertId;
      const postjournals2Rows = await journalsDao.postjournals2(
        challengeId,
        text,
        open
      );

      if (goalId1[0].amount > 0) {
        console.log(goalId1[0].amount);
        const bookstatusRows = await challengeDao.Goal_bookstatus(goalId);
        console.log(bookstatusRows);
        if (goalId1[0].amount === bookstatusRows[0].goalBookId) {
          await challengeDao.patchComplete(goalId);
        }
      }

      if (postjournals2Rows.affectedRows === 1)
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "일지 작성 성공",
        });
      else if (postjournals2Rows.affectedRows === 0)
        return res.json({
          isSuccess: true,
          code: 2301,
          message: "일지가 작성되지 않았습니다.",
        });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "일지 작성 실패",
      });
  } catch (err) {
    logger.error(`postJournal - error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//일지수정
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

    const { journalId, text, open } = req.body;

    if (
      journalId.length === 0 ||
      journalId === undefined ||
      text.length === 0 ||
      text === undefined ||
      open.length === 0 ||
      open === undefined
    )
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const journaluserRows = await journalsDao.journaluser(journalId);
    console.log(journaluserRows);

    if (journaluserRows.length === 0)
      return res.json({
        isSuccess: false,
        code: 2228,
        message: "어느 유저가 쓴 일지인지 정확하지 않아 수정할 수 없습니다.",
      });
    else if (journaluserRows[0].userId !== jwt)
      return res.json({
        isSuccess: false,
        code: 2227,
        message: "수정할 일지를 작성한 유저와 수정할 유저가 다릅니다.",
      });

    const patchjournalsRows = await journalsDao.patchjournals(
      journalId,
      text,
      open
    );

    if (patchjournalsRows.changedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "일지 수정 성공",
      });
    } else if (patchjournalsRows.changedRows === 0) {
      return res.json({
        isSuccess: false,
        code: 2226,
        message: "수정할 내용이 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "일지 수정 실패",
      });
  } catch (err) {
    logger.error(`reviseJournal - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//일지삭제
exports.deletejournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const journalId = req.params.journalId;
    console.log(journalId);
    if (journalId.length === 0 || journalId === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const journaluserRows = await journalsDao.journaluser(journalId);

    if (journaluserRows.length === 0)
      return res.json({
        isSuccess: false,
        code: 2228,
        message: "어느 유저가 쓴 일지인지 정확하지 않아 삭제할 수 없습니다.",
      });
    else if (journaluserRows[0].userId !== jwt)
      return res.json({
        isSuccess: false,
        code: 2227,
        message: "수정할 일지를 작성한 유저와 삭제할 유저가 다릅니다.",
      });

    const deletejournalsRows = await journalsDao.deletejournals(journalId);
    console.log(deletejournalsRows);
    if (deletejournalsRows.affectedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "일지 삭제 성공",
      });
    } else if (deletejournalsRows.affectedRows === 0) {
      return res.json({
        isSuccess: false,
        code: 2228,
        message: "삭제할 일지가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "일지 삭제 실패",
      });
  } catch (err) {
    logger.error(`deleteJournal - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 일지 수정할때 이미 작성한 내용 불러오는 API
exports.getpatchjournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const journalId = req.params.journalId;

    console.log(journalId);
    if (journalId === undefined || journalId.length === 0)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "입력을 해주세요.",
      });

    const getpatchjournalsRows = await journalsDao.getpatchjournals(journalId);

    if (getpatchjournalsRows.length > 0 || getpatchjournalsRows === undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "수정할 일지 조회 성공",
        result: getpatchjournalsRows,
      });
    } else if (getpatchjournalsRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "불러올 일지가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "수정할 일지 조회 실패",
      });
  } catch (err) {
    logger.error(`getReviseJournal - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
// 내가쓴 일지 조회
exports.getjournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    var align = req.query.align;
    var page = req.query.page;
    var limit = req.query.limit;

    console.log(align);

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const getjournalsRows = await journalsDao.getjournals(
      jwt,
      align,
      page,
      limit
    );
    const journalcountRows = await journalsDao.journalcount(jwt);
    if (getjournalsRows.length > 0 || getjournalsRows != undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "내가 쓴 일지 조회 성공",
        journalcount: journalcountRows[0].journalcount,
        result: getjournalsRows,
      });
    } else if (getjournalsRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "불러올 일지가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "내가 쓴 일지 조회 실패",
      });
  } catch (err) {
    logger.error(`getMyJournal - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 커뮤니티 일지 조회
exports.getcomjournals = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });
    const page = req.query.page;
    const limit = req.query.limit;
    //const getcomjournalsRows = await journalsDao.getcomjournals(page, limit);
    /*Heather : 위의 코드 한 줄을 빼고*/
    //const getParams = [parseInt(page), parseInt(limit)];
    const getcomjournalsRows = await journalsDao.getcomjournals(page, limit);
    /*여기까지를 넣었습니다!*/
    const journalcount2Rows = await journalsDao.journalcount2();

    if (getcomjournalsRows.length > 0 || getcomjournalsRows !== undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "커뮤니티 일지 조회 성공",
        journalcount: journalcount2Rows[0].journalcount,
        result: getcomjournalsRows,
      });
    } else if (getcomjournalsRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "커뮤니티에 작성된 일지가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "커뮤니티 일지 조회 실패",
      });
  } catch (err) {
    logger.error(`communityJournals - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
