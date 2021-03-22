const { pool } = require("../../../config/database");

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
//////////////////////////////////////////목표인덱스 찾기//////////////////////////////////////////////
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
//////////////////////////////////////////일지 수정//////////////////////////////////////////////
async function patchjournals(journalId, text, journalImageURL, open) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  UPDATE Reading_journal 
  SET text = '${text}', journalImageURL = '${journalImageURL}', open = '${open}'
  WHERE journalId = ${journalId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지 삭제//////////////////////////////////////////////
async function deletejournals(journalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  DELETE
  FROM Reading_journal
  WHERE journalId = ${journalId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////수정할 일지 조회//////////////////////////////////////////////
async function getpatchjournals(journalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select journalId, text, journalImageURL, open, time, page, Challenge.percent, title, writer, imageURL
  from Reading_journal
  inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
  inner join Goal_book on Goal_book.goalId = Reading_journal.goalId
  inner join Book on Book.publishNumber = Goal_book.publishNumber
  where journalId = ${journalId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////내가쓴 일지 조회//////////////////////////////////////////////
async function getjournals(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select title, Reading_journal.text as text, DATE_FORMAT(postAt, '%Y-%m-%d') as postAt,
  Challenge.percent as percent, time, page, Book.bookId
from Reading_journal
inner join Challenge on Reading_journal.challengeId = Challenge.challengeId
inner join Goal_book on Goal_book.goalId = Challenge.goalId
inner join Book on Book.bookId = Goal_book.bookId
where Challenge.userId = ${userId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}

module.exports = {
  postjournals,
  postjournals2,
  getgoalBookId,
  patchjournals,
  deletejournals,
  getpatchjournals,
  getjournals,
};
