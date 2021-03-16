const { pool } = require("../../../config/database");

// 목표추가
async function postchallenge(userId, period, amount, time) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  insert into Goal(userId, period, amount, time)
  value (${userId}, '${period}', ${amount}, ${time})`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 책추가
async function postbook(
  writer,
  publishDate,
  publishNumber,
  contents,
  imageURL,
  title,
  publisher
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  insert into Book(writer, publishDate, publishNumber, contents, imageURL, title, publisher)
  value ('${writer}', '${publishDate}', '${publishNumber}', '${contents}', '${imageURL}', '${title}', '${publisher}')`;

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
  select amount,
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
  where goalBookId = ${goalBookId}
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
where date(Challenge.createAt) = curdate() && Challenge.goalId = ${goalId};`;

  const [rows] = await connection.query(getchallenge2Query);
  connection.release();
  return rows;
}
module.exports = {
  postchallenge,
  getbook,
  postbook,
  postchallengeBook,
  getchallenge1,
  getchallenge2,
  getchallenge3,
};
