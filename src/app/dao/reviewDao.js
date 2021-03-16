const { pool } = require("../../../config/database");

async function whatIsYourName(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const nameQuery = `
                 SELECT name FROM User WHERE userId = ?;
                 `;

  const nameParams = [userId];
  const [nameRows] = await connection.query(
      nameQuery,
      nameParams
  );

  connection.release();
  return nameRows;
}

async function isPosted(bookId, text) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postedReviewQuery = `
                 SELECT EXISTS(SELECT * FROM Review WHERE bookId = ? AND text = ?) as exist;
                 `;

  const postedReviewParams = [bookId, text];
  const [exist] = await connection.query(
      postedReviewQuery,
      postedReviewParams
  );

  connection.release();
  return exist;
}

async function isValidBookId(bookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validQuery = `
                     SELECT EXISTS(SELECT * FROM Book WHERE bookId = ?) as exist;
                     `;

  const validParams = [bookId];
  const [validRows] = await connection.query(
      validQuery,
      validParams
  );

  connection.release();
  return validRows;
}

async function postReview(reviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const reviewQuery = `
                 INSERT INTO Review(bookId, userId, star, text, isPublic)
                 VALUES (?,?,?,?,?)
                 `;

  const [reviewRows] = await connection.query(
      reviewQuery,
      reviewParams
  );

  connection.release();
  return reviewRows;
}

async function isValidReviewId(reviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validReviewQuery = `
                 SELECT EXISTS(SELECT * FROM Review WHERE reviewId = ?) as exist;
                 `;
  const validReviewParam = [reviewId];
  const [validReviewRow] = await connection.query(
      validReviewQuery,
      validReviewParam
  );

  connection.release();
  return validReviewRow;
}

async function isAuthorizedUser(reviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validReviewQuery = `
                 SELECT userId FROM Review WHERE reviewId = ?;
                 `;
  const validReviewParam = [reviewId];
  const [validReviewRow] = await connection.query(
      validReviewQuery,
      validReviewParam
  );

  connection.release();
  return validReviewRow;
}

async function changePublic(reviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const publicQuery = `
    UPDATE Review SET isPublic = IF(isPublic = 1, 0, 1) WHERE reviewId = ?;
                 `;

  const publicParam = [reviewId];
  const [publicRow] = await connection.query(
      publicQuery,
      publicParam
  );

  connection.release();
  return publicRow;
}

module.exports = {
  postReview,
  whatIsYourName,
  isPosted,
  isValidBookId,
  isAuthorizedUser,
  changePublic,
  isValidReviewId,
};
