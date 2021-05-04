const { pool } = require("../../../config/database");

//////////////////////////////////////////일지추가//////////////////////////////////////////////
async function postjournals(
  timeY,
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
  values (${timeY}, ${page}, ${percent}, ${goalBookId}, ${goalId}, ${jwt}, ${charPercent})`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지추가2//////////////////////////////////////////////
async function postjournals2(challengeId, text, open) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  insert into Reading_journal(challengeId, text, open)
  values ( ${challengeId}, '${text}', '${open}')`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////목표인덱스 찾기//////////////////////////////////////////////
async function getgoalBookId(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select userId, Goal.goalId, amount
  from Goal_book
  inner join Goal on Goal_book.goalId = Goal.goalId
  where goalBookId = ${goalBookId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지 수정//////////////////////////////////////////////
async function patchjournals(journalId, text, open) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  UPDATE Reading_journal 
  SET text = '${text}', open = '${open}'
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
  select journalId, text, open, time, page, Challenge.percent, title, writer, imageURL, journalId
  from Reading_journal
  inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
  inner join Goal_book on Goal_book.goalId = Challenge.goalId
  inner join Book on Book.bookId = Goal_book.bookId
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
  Book.publishNumber
from Reading_journal
inner join Challenge on Reading_journal.challengeId = Challenge.challengeId
inner join Goal_book on Goal_book.goalBookId = Challenge.goalBookId
inner join Book on Book.bookId = Goal_book.bookId
where Challenge.userId = ${userId}
order by Reading_journal.createAt ${align} limit ${page}, ${limit}`;
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
  Reading_journal.journalId,
  User.userId,
  User.profilePictureURL,
  User.name
from Reading_journal
    inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
    inner join Goal_book on Challenge.goalBookId = Goal_book.goalBookId
    inner join User on User.userId = Challenge.userId
    inner join Book on Book.bookId = Goal_book.bookId
where Reading_journal.open = 'Y'
order by Reading_journal.createAt desc limit ${page}, ${limit}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////일지수정, 삭제, 추가 위한 목표유저확인//////////////////////////////////////////////
async function journaluser(journalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select Goal.userId
  from Reading_journal
    inner join Challenge on Challenge.challengeId = Reading_journal.challengeId
  inner join Goal on Challenge.goalId = Goal.goalId
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
/*
 * API 기능 : 일지 조회
 * 작 성 자  : Heather
 */
async function getComJournals(getParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT     C.userId, name, IFNULL(U.profilePictureURL, '사진 없음') as profilePic,
               journalId, text, DATE_FORMAT(postAt, '%Y.%m.%d') as postAt, CONCAT(C.percent,'%') as percent,
               CONCAT(C.page, '쪽') as page, C.time,
               G.bookId, B.title, B.writer, B.imageURL,
               IF(G.status = 'Y', '완독', '읽는 중') as status
    FROM       Reading_journal
    INNER JOIN Challenge C on Reading_journal.challengeId = C.challengeId
    INNER JOIN User U on U.userId = C.userId
    INNER JOIN Goal_book G on G.goalBookId = C.goalBookId
    INNER JOIN Book B on G.bookId = B.bookId
    ORDER BY   postAt DESC
    LIMIT      ?, ?;
    `;
  const [rows] = await connection.query(query, getParams);
  connection.release();
  return rows;
}

//////////////////////////////////////////퍼센트가 100이면 완독표시//////////////////////////////////////////////
async function percentY(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  update Goal_book
  SET Goal_book.status = 'Y'
  where goalBookId = ${goalBookId}`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
//////////////////////////////////////////이전일지 퍼센트 가져오기//////////////////////////////////////////////
async function journalpercent(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select Challenge.percent
  from Challenge
  where goalBookId = ${goalBookId}
  order by challengeId desc limit 1`;
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
  getComJournals,
  percentY,
  journalpercent,
};
