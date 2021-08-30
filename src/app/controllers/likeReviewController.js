//const { pool } = require("../../../config/database");
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
    //const connection = await pool.getConnection(async (conn) => conn);

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
          code: 2019,
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

      logger.error(`likeReview - non transaction Query error\n: ${JSON.stringify(err)}`);

      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "평가/리뷰 좋아요 등록 실패",
      });
    }
  } catch (err) {

    logger.error(`likeReview:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(err)}`);

    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰에 댓글 등록 API
 */
exports.comment = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    //const connection = await pool.getConnection(async (conn) => conn);

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

      const text = req.body.text;
      const likeReviewParams = [reviewId, userId, text];
      const isDuplicatedComment = await likeReviewDao.isDuplicatedComment(
        likeReviewParams
      );

      if (isDuplicatedComment[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2020,
          message: "같은 내용의 댓글은 등록할 수 없습니다.",
        });
      }

      await likeReviewDao.postComment(likeReviewParams);
      return res.json({
        isSuccess: false,
        code: 1000,
        message: "댓글 등록 성공",
      });
    } catch (err) {

      logger.error(`postComment - non transaction Query error\n: ${JSON.stringify(err)}`);

      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "댓글 등록 실패",
      });
    }
  } catch (err) {

    logger.error(`postComment:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(err)}`);

    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰에 등록한 댓글 삭제 API
 */
exports.deleteComment = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    //const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const commentId = req.params.commentId;
      const isValidCommentId = await likeReviewDao.isValidCommentId(commentId);
      if (isValidCommentId[0].exist === 0) {
        return res.json({
          isSuccess: false,
          code: 2021,
          message: "유효하지 않은 Comment Id입니다.",
        });
      }

      const isCommentOwnerId = await likeReviewDao.isAuthorizedUser(commentId);
      if (isCommentOwnerId[0].userId != userId) {
        return res.json({
          isSuccess: false,
          code: 2022,
          message: "댓글 삭제 권한이 없습니다.",
        });
      }

      const isDeletedComment = await likeReviewDao.isDeletedComment(commentId);
      if (isDeletedComment[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2023,
          message: "이미 삭제된 댓글입니다.",
        });
      }

      await likeReviewDao.deleteComment(commentId);
      return res.json({
        isSuccess: false,
        code: 1000,
        message: "댓글 삭제 성공",
      });
    } catch (err) {

      logger.error(`deleteComment - non transaction Query error\n: ${JSON.stringify(err)}`);

      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "댓글 삭제 실패",
      });
    }
  } catch (err) {

    logger.error(`deleteComment:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(err)}`);

    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰에 등록한 댓글 신고 API
 */
exports.reportComment = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    //const connection = await pool.getConnection(async (conn) => conn);

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

      const commentId = req.params.commentId;
      const isValidCommentId = await likeReviewDao.isValidCommentId(commentId);
      if (isValidCommentId[0].exist === 0) {
        return res.json({
          isSuccess: false,
          code: 2021,
          message: "유효하지 않은 Comment Id입니다.",
        });
      }

      const isDeletedComment = await likeReviewDao.isDeletedComment(commentId);
      if (isDeletedComment[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2023,
          message: "이미 삭제된 댓글입니다.",
        });
      }

      const isDuplicatedReport = await likeReviewDao.isDuplicatedReport(
        commentId,
        userId
      );
      if (isDuplicatedReport[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2024,
          message: "이미 신고한 댓글입니다.",
        });
      }

      await likeReviewDao.reportComment(commentId, userId);
      return res.json({
        isSuccess: false,
        code: 1000,
        message: "댓글 신고 성공",
      });
    } catch (err) {

      logger.error(`reportComment - non transaction Query error\n: ${JSON.stringify(err)}`);

      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "댓글 신고 실패",
      });
    }
  } catch (err) {

    logger.error(`reportComment:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(err)}`);

    return false;
  }
};
