const { pool } = require("../../../config/database");

// index
async function reviewDao(reviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postReviewQuery = `
                           INSERT INTO Review(bookId, userId, star, text, reviewImageURL, isPublic)
                           VALUES (?,?,?,?,?,?)
                           `;

  const reviewRow = await connection.query(
      postReviewQuery,
      reviewParams
  );

  const [rows] = await connection.query(postReviewQuery)
  connection.release();

  return rows;
}

module.exports = {
  reviewDao,
};
