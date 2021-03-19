const { pool } = require("../../../config/database");

// 목표추가
async function postchallenge(userId, period, amount, time, expriodAt) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  insert into Goal(userId, period, amount, time, expriodAt)
  value (${userId}, '${period}', ${amount}, ${time}, '${expriodAt}')`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 책있는지 확인
async function getbook(publishNumber) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select *
  from Book
  where publishNumber = '${publishNumber}'`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 목표책추가
async function postchallengeBook(goalId, publishNumber) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  insert into Goal_book(goalId, publishNumber)
  value (${goalId}, '${publishNumber}')`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회1
async function getchallenge1(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Goal.goalId as goalId, amount,
  time,
  period,
  expriodAt,
  Book.title,
  Book.writer,
  Book.imageURL,
  Book.publishNumber,
  Goal_book.goalBookId
from Goal
    inner join Goal_book on Goal.goalId = Goal_book.goalId
    inner join (select title, writer, imageURL, publishNumber from Book) Book
               on Book.publishNumber = Goal_book.publishNumber
where Goal.goalId = ${goalId}`;

  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회2
async function getchallenge2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge2Query = `
  select *
  from (select goalBookId, page, percent, sum(time) from Challenge
  where goalBookId = ${goalBookId} && status = 'Y'
  order by createAt DESC limit 1) a
  group by goalBookId`;

  const [rows] = await connection.query(getchallenge2Query);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회3 // 오늘 독서시간 및 작성일지 조회
async function getchallenge3(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge2Query = `
  select sum(Challenge.time) as sumChallengeTime,
  (select count(journalId)
   from Reading_journal
   where date(Reading_journal.postAt) = curdate() && Reading_journal.goalId = ${goalId}) as countJournal
from Challenge
where date(Challenge.createAt) = curdate() && Challenge.goalId = ${goalId} && Challenge.status = 'Y'`;

  const [rows] = await connection.query(getchallenge2Query);
  connection.release();
  return rows;
}
// 챌린지 중복책인지 조회
async function getgoalbook(publishNumber, goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select *
  from Goal_book
  where publishNumber = '${publishNumber}' && goalId = ${goalId}`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 챌린지 책 변경
async function patchchallengeBook(publishNumber, goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeBookQuery = `
  UPDATE Goal_book
  SET publishNumber = '${publishNumber}'
  WHERE goalBookId = ${goalBookId};`;
  const patchchallengeBook2Query = `
  update Challenge
  SET status = 'N'
  WHERE goalbookId = ${goalBookId}`;
  const [rows] = await connection.query(
    patchchallengeBookQuery,
    patchchallengeBook2Query
  );
  connection.release();
  return rows;
}
// 챌린지 책 변경
async function deletechallengeBook(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeBookQuery = `
  DELETE
FROM Goal_book
WHERE goalBookId = ${goalBookId};`;
  const patchchallengeBook2Query = `
  update Challenge
  SET status = 'N'
  WHERE goalbookId = ${goalBookId}`;
  const [rows] = await connection.query(
    patchchallengeBookQuery,
    patchchallengeBook2Query
  );
  connection.release();
  return rows;
}
// 생성목표 유저확인
async function goalBookId(goalBookId, jwt) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select userId
from Goal_book
inner join Goal on Goal_book.goalId = Goal.goalId
where goalBookId = ${goalBookId} && userId = ${jwt};`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 챌린지 변경
async function patchchallenge(goalId, period, amount, time, expriodAt) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeQuery = `
  update Goal
  SET period = '${period}', amount = ${amount}, time = ${time}, expriodAt = '${expriodAt}'
  WHERE goalId = ${goalId}`;
  const [rows] = await connection.query(patchchallengeQuery);
  connection.release();
  return rows;
}
//////////////////////////////////////////날짜확인//////////////////////////////////////////////
async function calendarYN(jwt, expriodAt) {
  // 데이터베이스 함수를 selectmypage로 함
  const connection = await pool.getConnection(async (conn) => conn);
  const calendarYNQuery = `
  select *
  from Goal
  where userId = ${jwt}
  and (createAt between now() and '${expriodAt}'
     or expriodAt between now() and '${expriodAt}')`;
  const [calendarYNRows] = await connection.query(calendarYNQuery);
  connection.release();
  return calendarYNRows;
}
// 오늘의 챌린지 조회1
async function getgoalId(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select *
  from Goal
  where userId = ${userId}
  and (curdate() between createAt and Goal.expriodAt)`;

  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
module.exports = {
  postchallenge,
  getbook,
  postchallengeBook,
  getchallenge1,
  getchallenge2,
  getchallenge3,
  getgoalbook,
  patchchallengeBook,
  deletechallengeBook,
  goalBookId,
  patchchallenge,
  calendarYN,
  getgoalId,
};
