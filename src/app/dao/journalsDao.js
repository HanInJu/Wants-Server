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

//////////////////////////////////////////일지추가//////////////////////////////////////////////
async function postjournals(time, page, percent, goalBookId, goalId, jwt) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  insert into Challenge(time, page, percent, goalBookId, goalId, userId)
  values (${time}, ${page}, ${percent}, ${goalBookId}, ${goalId}, ${jwt})`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지추가2//////////////////////////////////////////////
async function postjournals2(challengeId, text, journalImageURL, open) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  insert into Reading_journal(challengeId, text, journalImageURL, open)
  values ( ${challengeId}, '${text}', '${journalImageURL}' , '${open}')`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지추가2//////////////////////////////////////////////
async function getgoalBookId(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select GoalId
  from Goal_book
  where goalBookId = ${goalBookId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
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
  postjournals,
  postjournals2,
  getgoalBookId,
};
