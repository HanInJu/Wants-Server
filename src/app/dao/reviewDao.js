const { pool } = require("../../../config/database");

async function whatIsYourName(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const nameQuery = `
                 SELECT name FROM User WHERE userId = ?;
                 `;

  const nameParams = [userId];
  const [nameRows] = await connection.query(nameQuery, nameParams);

  connection.release();
  return nameRows;
}

async function isPosted(bookId, text) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postedReviewQuery = `
                 SELECT EXISTS(SELECT * FROM Review WHERE bookId = ? AND text = ?) as exist;
                 `;

  const postedReviewParams = [bookId, text];
  const [exist] = await connection.query(postedReviewQuery, postedReviewParams);

  connection.release();
  return exist;
}

async function isValidBookId(bookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validQuery = `
                     SELECT EXISTS(SELECT * FROM Book WHERE bookId = ?) as exist;
                     `;

  const validParams = [bookId];
  const [validRows] = await connection.query(validQuery, validParams);

  connection.release();
  return validRows;
}

async function postReview(reviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const reviewQuery = `
                 INSERT INTO Review(bookId, userId, star, text, isPublic)
                 VALUES (?,?,?,?,?)
                 `;

  const [reviewRows] = await connection.query(reviewQuery, reviewParams);

  connection.release();
  return reviewRows;
}

async function isValidReviewId(reviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validReviewQuery = `
    SELECT EXISTS(SELECT * FROM Review WHERE reviewId = ? AND status = 'OK') as exist;
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

async function isDuplicatedText(text) {
  const connection = await pool.getConnection(async (conn) => conn);
  const duplicatedTextQuery = `
    SELECT EXISTS(SELECT * FROM Review WHERE text = ?) as exist;
                      `;

  const [duplicatedTextRow] = await connection.query(duplicatedTextQuery, text);

  connection.release();
  return duplicatedTextRow;
}

async function reviseReview(reviseReviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const publicQuery = `
                      UPDATE Review SET star = ?, text = ?, isPublic = ? WHERE reviewId = ?;
                      `;

  const [publicRow] = await connection.query(publicQuery, reviseReviewParams);

  connection.release();
  return publicRow;
}

async function deleteReview(reviewId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteQuery = `
                       UPDATE Review SET status = 'DELETE' WHERE reviewId = ?;
                      `;

  const [deleteRow] = await connection.query(deleteQuery, reviewId);

  connection.release();
  return deleteRow;
}

async function isDuplicatedReport(reportParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const duplicatedReportQuery = `
    SELECT EXISTS(SELECT * FROM Review_report WHERE reviewId = ? AND userId = ?) AS exist;
                      `;
  const [duplicatedReportRow] = await connection.query(duplicatedReportQuery, reportParams);

  connection.release();
  return duplicatedReportRow;
}

async function reportReview(reportParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const reportQuery = `
    INSERT INTO Review_report(reviewId, userId, status) VALUES(?,?,'REPORTED');
                      `;
  const [reportRow] = await connection.query(reportQuery, reportParams);

  connection.release();
  return reportRow;
}

module.exports = {
  postReview,
  whatIsYourName,
  isPosted,
  isValidBookId,
  isAuthorizedUser,
  isDuplicatedText,
  reviseReview,
  isValidReviewId,
  deleteReview,
  isDuplicatedReport,
  reportReview,
};
