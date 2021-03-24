const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 내 서재 - 내 리뷰 조회 미완성 !!!!
 */
exports.getReview = async function (req, res) {
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
      //const align = req.param("align");
        const align = req.params("align");
        console.log(align);
      if (align == "asc") { //오래된 순 정렬

      } else if (align == "desc") { //최신순 정렬

      } else { //그 외 에러
          return res.json({
              isSuccess: false,
              code: 2018,
              message: "정렬 필터를 최신순 또는 오래된 순으로 선택해주세요.",
          });
      }

    } catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "내 서재 평가/리뷰 조회 실패",
      });
    }

  } catch (err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.16.TUE
 * API 기 능 : 리뷰 작성
 */
exports.postReview = async function (req, res) {
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

      const isValidBookId = await reviewDao.isValidBookId(bookId);
      if (isValidBookId[0].exist === 0) {
        return res.json({
          isSuccess: false,
          code: 2011,
          message: "유효하지 않은 Book Id입니다.",
        });
      }

      const exist = await reviewDao.isPosted(bookId, text);
      if (exist[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2010,
          message: "같은 내용의 리뷰는 등록할 수 없습니다.",
        });
      }

      const reviewParams = [bookId, userId, star, text, isPublic];
      await reviewDao.postReview(reviewParams);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "평가/리뷰 작성 성공",
      });
    } catch (err) {
      logger.error(
        `example non transaction Query error\n: ${JSON.stringify(err)}`
      );
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "평가/리뷰 작성 실패",
      });
    }
  } catch (err) {
    logger.error(
      `example non transaction DB Connection error\n: ${JSON.stringify(err)}`
    );
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰 내용, 별점, 공개여부 수정
 */
exports.reviseReview = async function (req, res) {
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
      if (isReviewOwnerId[0].userId != userId) {
        return res.json({
          isSuccess: false,
          code: 2013,
          message: "평가/리뷰를 수정할 권한이 없습니다.",
        });
      }

      const { star, text, isPublic } = req.body;

      if (star == null || text == null || isPublic == null) {
        return res.json({
          isSuccess: false,
          code: 2014,
          message: "별점, 리뷰내용, 공개여부를 모두 입력/선택해주세요.",
        });
      }

      const exist = await reviewDao.isDuplicatedText(text);

      if (exist[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2015,
          message: "동일한 내용으로는 리뷰를 수정할 수 없습니다.",
        });
      }

      const reviseReviewParams = [star, text, isPublic, reviewId];
      await reviewDao.reviseReview(reviseReviewParams);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "평가/리뷰 수정 성공",
      });
    } catch (err) {
      logger.error(
        `example non transaction Query error\n: ${JSON.stringify(err)}`
      );
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "평가/리뷰 수정 실패",
      });
    }
  } catch (err) {
    logger.error(
      `example non transaction DB Connection error\n: ${JSON.stringify(err)}`
    );
    return false;
  }
};
/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰 삭제
 */
exports.deleteReview = async function (req, res) {

    try {
        const userId = req.verifiedToken.id;
        const connection = await pool.getConnection(async conn => conn);
        const userRows = await userDao.getuser(userId);
        if (userRows[0] === undefined)
            return res.json({
                isSuccess: false,
                code: 4020,
                message: "가입되어있지 않은 유저입니다.",
            });

        try {
            const reviewId = req.params.reviewId;
            const isValidReviewId = await reviewDao.isValidReviewId(reviewId);
            if (isValidReviewId[0].exist === 0) {
                return res.json({
                    isSuccess: false,
                    code: 2012,
                    message: "유효하지 않은 Review Id입니다."
                });
            }

            const isReviewOwnerId = await reviewDao.isAuthorizedUser(reviewId);
            if (isReviewOwnerId[0].userId != userId) {
                return res.json({
                    isSuccess: false,
                    code: 2013,
                    message: "평가/리뷰를 삭제할 권한이 없습니다."
                });
            }

            await reviewDao.deleteReview(reviewId);
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "평가/리뷰 삭제 성공"
            });

        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 삭제 실패"
            });
        }
    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 리뷰 신고
 */
exports.reportReview = async function (req, res) {
    try {
            const userId = req.verifiedToken.id;
            const connection = await pool.getConnection(async conn => conn);
            const userRows = await userDao.getuser(userId);
            if (userRows[0] === undefined)
                return res.json({
                    isSuccess: false,
                    code: 4020,
                    message: "가입되어있지 않은 유저입니다.",
                });

        try {
            const reviewId = req.params.reviewId;
            const isValidReviewId = await reviewDao.isValidReviewId(reviewId);
            if (isValidReviewId[0].exist === 0) {
                return res.json({
                    isSuccess: false,
                    code: 2012,
                    message: "유효하지 않은 Review Id입니다."
                });
            }

            const isReviewOwnerId = await reviewDao.isAuthorizedUser(reviewId);
            if(isReviewOwnerId[0].userId === userId) {
                return res.json({
                    isSuccess: false,
                    code: 2016,
                    message: "자신의 평가/리뷰는 신고할 수 없습니다."
                });
            }

            const reportParams = [reviewId, userId];
            const isDuplicatedReport = await reviewDao.isDuplicatedReport(reportParams);

            if(isDuplicatedReport[0].exist === 1) {
                return res.json({
                    isSuccess: false,
                    code: 2017,
                    message: "이미 신고한 평가/리뷰입니다."
                });
            }

            await reviewDao.reportReview(reportParams);
            return res.json({
                isSuccess: false,
                code: 1000,
                message: "평가/리뷰 신고접수 완료."
            });

        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 신고 실패"
            });
        }

    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }

};

exports.getComments = async function (req, res) {
    try {
        const userId = req.verifiedToken.id;
        const connection = await pool.getConnection(async conn => conn);
        const userRows = await userDao.getuser(userId);
        if (userRows[0] === undefined)
            return res.json({
                isSuccess: false,
                code: 4020,
                message: "가입되어있지 않은 유저입니다.",
            });

        try {
            const reviewId = req.params.reviewId;
            const isValidReviewId = await reviewDao.isValidReviewId(reviewId);
            if (isValidReviewId[0].exist === 0) {
                return res.json({
                    isSuccess: false,
                    code: 2012,
                    message: "유효하지 않은 Review Id입니다."
                });
            }

            const reviewNum = await reviewDao.getCommentsNum(reviewId);
            const reviewComments = await reviewDao.getComments(reviewId);
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "평가/리뷰의 댓글 조회 완료.",
                commentsNum: "댓글 " + reviewNum[0].commentNum + "개",
                comments: reviewComments,
            });

        } catch (err) {
            logger.error(`getComments - non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 신고 실패"
            });
        }

    } catch (err) {
        logger.error(`getComments - non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
}