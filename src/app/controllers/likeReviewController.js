const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const likeReviewDao = require("../dao/likeReviewDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");


/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰 좋아요 등록 및 삭제
 */
exports.like = async function (req, res) {
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

      const reviewId = req.params.reviewId;
      const isValidReviewId = await reviewDao.isValidReviewId(reviewId);
      if (isValidReviewId[0].exist === 0) {
        return res.json({
          isSuccess: false,
          code: 2012,
          message: "유효하지 않은 Review Id입니다.",
        });
      }

      const isReviewOwnerId = await reviewDao.isAuthorizedUser(reviewId);
      if (isReviewOwnerId[0].userId === userId) {
        return res.json({
          isSuccess: false,
          code: 2013,
          message: "자신의 평가/리뷰는 좋아요를 누를 수 없습니다.",
        });
      }

      await likeReviewDao.like(reviewId, userId);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "평가/리뷰 좋아요 등록/취소 성공",
      });

    } catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "평가/리뷰 좋아요 등록 실패",
      });
    }

  } catch (err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

