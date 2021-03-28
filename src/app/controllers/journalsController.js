const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reviewDao = require("../dao/reviewDao");
const journalsDao = require("../dao/journalsDao");
const userDao = require("../dao/userDao");
var url = require("url");
/*
 * API 기 능 : 일지 추가
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

    const goalId1 = await journalsDao.getgoalBookId(goalBookId);

    console.log(goalId1, jwt);
    if (goalId1.length == 0)
      return res.json({
        isSuccess: true,
        code: 2225,
        message: "일지를 작성할 책이 선택되지 않았습니다.",
      });
    else if (goalId1[0].userId !== jwt)
      return res.json({
        isSuccess: true,
        code: 2226,
        message: "목표로 등록한 책의 유저와 일지를 작성할 유저가 다릅니다.",
      });
    const goalId = goalId1[0].goalId;

    const charPercent2 = await journalsDao.getpercent(goalBookId);
    const charPercent1 = charPercent2[0].percent;
    const charPercent = percent - charPercent1;
    console.log(charPercent, goalBookId, goalId);
    const postjournalsRows = await journalsDao.postjournals(
      time,
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
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

    const { journalId, text, journalImageURL, open } = req.body;

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
      journalImageURL,
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
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

    if (getjournalsRows.length > 0 || getjournalsRows != undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "내가 쓴 일지 조회 성공",
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
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
    var page = req.query.page;
    var limit = req.query.limit;
    const getcomjournalsRows = await journalsDao.getcomjournals(page, limit);

    if (getcomjournalsRows.length > 0 || getcomjournalsRows !== undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "커뮤니티 일지 조회 성공",
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
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
