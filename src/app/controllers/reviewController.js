const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");

/*
 * 최종 수정일 : 2021.03.16.TUE
 * API 기 능 : 내 서재 - 내 리뷰 조회
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
      const align = req.param("align");
      if (align == "DESC") {
        //오래된 순 정렬
      } else {
        //그 외에는 모두 최신순
      }
    } catch (err) {
      logger.error(
        `example non transaction Query error\n: ${JSON.stringify(err)}`
      );
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "평가/리뷰 조회 실패",
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
            if(isValidReviewId[0].exist === 0) {
                return res.json({
                    isSuccess: false,
                    code: 2012,
                    message: "유효하지 않은 Review Id입니다."
                });
            }

            const isReviewOwnerId = await reviewDao.isAuthorizedUser(reviewId);
            if(isReviewOwnerId[0].userId != userId) {
                return res.json({
                    isSuccess: false,
                    code: 2013,
                    message: "평가/리뷰를 수정할 권한이 없습니다."
                });
            }

            const {
                star, text, isPublic
            } = req.body;

            if(star == null || text == null || isPublic == null) {
                return res.json({
                    isSuccess: false,
                    code: 2014,
                    message: "별점, 리뷰내용, 공개여부를 모두 입력/선택해주세요."
                });
            }

            const exist = await reviewDao.isDuplicatedText(text);

            if(exist[0].exist === 1) {
                return res.json({
                    isSuccess: false,
                    code: 2015,
                    message: "동일한 내용으로는 리뷰를 수정할 수 없습니다."
                });
            }

            const reviseReviewParams = [star, text, isPublic, reviewId];
            await reviewDao.reviseReview(reviseReviewParams);
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "평가/리뷰 수정 성공"
            });


        } catch(err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 수정 실패"
            });
        }

    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
}
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
    }
}
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

    const goalId1 = await reviewDao.getgoalBookId(goalBookId);
    const goalId = goalId1[0].GoalId;

    console.log(goalId);
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
    console.log(goalId);
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
