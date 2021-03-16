const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const reviewDao = require('../dao/reviewDao');

exports.postReview = async function (req, res) {

    const { //userId는 토큰에서 읽어와야 한다.
        bookId, star, text, reviewImageURL, isPublic
    } = req.body;

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const reviewParams = [bookId, star, text, reviewImageURL, isPublic];
            const reviewRows = await reviewDao.reviewDao(reviewParams);
            return res.json(reviewRows); //여기까지 했어.

        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }

    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};