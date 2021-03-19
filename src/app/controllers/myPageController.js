const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const myPageDao = require("../dao/myPageDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");


/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 프로필 등록
 */
exports.profile = async function (req, res) {
  const { bookId, star, text, isPublic } = req.body;

  try {
    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const whatIsYourName = await reviewDao.whatIsYourName(userId);
      if (whatIsYourName[0].name === "Reader") {
        return res.json({
          isSuccess: false,
          code: 3001,
          message: "닉네임을 설정해주세요.",
        });
      }

      await myPageDao.profile(userId);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "프로필 등록 성공",
      });

    } catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "프로필 등록 실패",
      });
    }

  } catch (err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

