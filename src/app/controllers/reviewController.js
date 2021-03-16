const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const reviewDao = require('../dao/reviewDao');

/*
 * 최종 수정일 : 2021.03.16.TUE
 * API 기 능 : 내 서재 - 내 리뷰 조회
 */

exports.getReview = async function (req, res) {
    try {
        var userId = req.verifiedToken.id;
        const connection = await pool.getConnection(async conn => conn);

        try {



        } catch(err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 조회 실패"
            });
        }


    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }

}

/*
 * 최종 수정일 : 2021.03.16.TUE
 * API 기 능 : 리뷰 작성
 */
exports.postReview = async function (req, res) {

    const {
        bookId, star, text, isPublic
    } = req.body;

    try {
        const userId = req.verifiedToken.id;
        const connection = await pool.getConnection(async conn => conn);

        try {

            const whatIsYourName = await reviewDao.whatIsYourName(userId);
            if (whatIsYourName[0].name === "Reader") {
                return res.json({
                    isSuccess: false,
                    code: 3001,
                    message: "닉네임을 설정해주세요."
                });
            }

            const isValidBookId = await reviewDao.isValidBookId(bookId);
            if(isValidBookId[0].exist === 0) {
                return res.json({
                    isSuccess: false,
                    code: 2011,
                    message: "유효하지 않은 Book Id입니다."
                });
            }

            const exist = await reviewDao.isPosted(bookId, text);
            if(exist[0].exist === 1) {
                return res.json({
                    isSuccess: false,
                    code: 2010,
                    message: "같은 내용의 리뷰는 등록할 수 없습니다."
                });
            }

            const reviewParams = [bookId, userId, star, text, isPublic];
            await reviewDao.postReview(reviewParams);
            return res.json({
                isSuccess: true,
                code: 1000,
                message: "평가/리뷰 작성 성공"
            });

        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json({
                isSuccess: false,
                code: 500,
                message: "평가/리뷰 작성 실패"
            });
        }

    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};