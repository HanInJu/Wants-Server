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

async function postComment(likeReviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postCommentQuery = `
    INSERT INTO Review_comment(reviewId, userId, text) VALUES(?,?,?);
                 `;

  const [postCommentRows] = await connection.query(
    postCommentQuery,
    likeReviewParams
  );
  connection.release();
  return postCommentRows;
}

async function isDuplicatedComment(likeReviewParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const duplicatedCommentQuery = `
    SELECT EXISTS(SELECT * FROM Review_comment WHERE reviewId = ? AND userId = ? AND text = ?) as exist;
                 `;

  const [duplicatedCommentRows] = await connection.query(
    duplicatedCommentQuery,
    likeReviewParams
  );
  connection.release();
  return duplicatedCommentRows;
}

async function isValidCommentId(commentId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validCommentQuery = `
    SELECT EXISTS(SELECT * FROM Review_comment WHERE commentId = ?) as exist;
                 `;

  const [validCommentRows] = await connection.query(
    validCommentQuery,
    commentId
  );
  connection.release();
  return validCommentRows;
}

async function isAuthorizedUser(commentId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const authorizedUserQuery = `
    SELECT userId FROM Review_comment WHERE commentId = ?;
                 `;

  const [authorizedUserRows] = await connection.query(
    authorizedUserQuery,
    commentId
  );
  connection.release();
  return authorizedUserRows;
}

async function isDeletedComment(commentId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deletedCommentQuery = `
    SELECT EXISTS(SELECT * FROM Review_comment WHERE commentId = ? AND status = 'DELETE') as exist;
                 `;

  const [deletedCommentRows] = await connection.query(
    deletedCommentQuery,
    commentId
  );
  connection.release();
  return deletedCommentRows;
}

async function deleteComment(commentId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteQuery = `
    UPDATE Review_comment SET status = 'DELETE' WHERE commentId = ?;
                 `;

  const [deleteRows] = await connection.query(deleteQuery, commentId);
  connection.release();
  return deleteRows;
}

async function isDuplicatedReport(commentId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT EXISTS (SELECT * FROM Review_comment_report WHERE commentId = ? AND userId = ? AND status = 'REPORTED') as exist;
                 `;

  const duplicatedParams = [commentId, userId];
  const [duplicatedRows] = await connection.query(query, duplicatedParams);
  connection.release();
  return duplicatedRows;
}

async function reportComment(commentId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const reportQuery = `
    INSERT INTO Review_comment_report(commentId, userId) VALUES(?,?);
                 `;

  const reportParams = [commentId, userId];
  const [reportRows] = await connection.query(reportQuery, reportParams);
  connection.release();
  return reportRows;
}

module.exports = {
  like,
  postComment,
  isDuplicatedComment,
  isValidCommentId,
  isAuthorizedUser,
  isDeletedComment,
  deleteComment,
  isDuplicatedReport,
  reportComment,
};
