const { pool } = require("../../../config/database");

//////////////////////////////////////////일지추가//////////////////////////////////////////////
async function postjournals(
  time,
  page,
  percent,
  goalBookId,
  goalId,
  jwt,
  charPercent
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  insert into Challenge(time, page, percent, goalBookId, goalId, userId, charPercent)
  values (${time}, ${page}, ${percent}, ${goalBookId}, ${goalId}, ${jwt}, ${charPercent})`;
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
  select userId, Goal.goalId
  from Goal_book
  inner join Goal on Goal_book.goalId = Goal.goalId
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
  select journalId, text, journalImageURL, open, time, page, Challenge.percent, title, writer, imageURL, journalId
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
async function getjournals(userId, align, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select title, Reading_journal.text as text, DATE_FORMAT(postAt, '%Y.%m.%d') as postAt,
  Challenge.percent as percent, time, page, Book.bookId, journalId,
  Reading_journal.journalImageURL as journalImageURL
from Reading_journal
inner join Challenge on Reading_journal.challengeId = Challenge.challengeId
inner join Goal_book on Goal_book.goalBookId = Challenge.goalBookId
inner join Book on Book.bookId = Goal_book.bookId
where Challenge.userId = ${userId}
order by postAt ${align} limit ${page}, ${limit}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////내가쓴 일지 조회//////////////////////////////////////////////
async function getpercent(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select Challenge.percent
  from Challenge
  where goalBookId = ${goalBookId}
  order by createAt DESC limit 1;`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////커뮤니티 일지 조회//////////////////////////////////////////////
async function getcomjournals(page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select Book.title,
  Book.imageURL,
  Book.writer,
  Book.bookId,
  Book.publishNumber,
  Challenge.percent,
  Challenge.page,
  Challenge.time,
  Goal_book.status,
  date_format(Reading_journal.postAt, '%Y.%m.%d') as postAt,
  Reading_journal.text,
  Reading_journal.journalImageURL,
  Reading_journal.journalId,
  User.userId,
  User.profilePictureURL,
  User.name
from Reading_journal
    inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
    inner join Goal_book on Challenge.goalBookId = Goal_book.goalBookId
    inner join User on User.userId = Challenge.userId
    inner join Book on Book.bookId = Goal_book.bookId
order by postAt DESC
limit ${page}, ${limit}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지수정, 삭제, 추가 위한 목표유저확인//////////////////////////////////////////////
async function journaluser(journalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select userId
  from Reading_journal
  inner join Goal on Reading_journal.goalId = Goal.goalId
  where journalId = ${journalId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지수정, 삭제, 추가 위한 목표유저확인//////////////////////////////////////////////
async function journalcount(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select count(Reading_journal.journalId) as journalcount from Reading_journal
  inner join Challenge on Reading_journal.challengeId = Challenge.challengeId
  where Challenge.userId = ${userId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지수정, 삭제, 추가 위한 목표유저확인//////////////////////////////////////////////
async function journalcount2() {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select count(journalId) as journalcount
  from Reading_journal
    inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
    inner join Goal_book on Challenge.goalBookId = Goal_book.goalBookId
    inner join User on User.userId = Challenge.userId
    inner join Book on Book.bookId = Goal_book.bookId
  where open = 'Y'`;
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
  getpercent,
  getcomjournals,
  journaluser,
  journalcount,
  journalcount2,
};
