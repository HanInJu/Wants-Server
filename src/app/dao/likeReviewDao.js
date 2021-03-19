const { pool } = require("../../../config/database");

async function like(reviewId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const likeQuery = `
    INSERT INTO Review_like(reviewId, userId) VALUES(?,?) ON DUPLICATE KEY UPDATE status = IF(status = 1, 0, 1);
                 `;

  const likeParams = [reviewId, userId];
  const [likeRows] = await connection.query(likeQuery, likeParams);

  connection.release();
  return likeRows;
}

module.exports = {
  like,
};
