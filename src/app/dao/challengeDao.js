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
  const [rows] = await connection.query(patchchallengeBookQuery);
  connection.release();
  return rows;
}
// 챌린지 책 변경
async function patchchallengeBook2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeBook2Query = `
  update Challenge
  SET status = 'N'
  WHERE goalbookId = ${goalBookId}`;
  const [rows] = await connection.query(patchchallengeBook2Query);
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
  const [rows] = await connection.query(patchchallengeBookQuery);
  connection.release();
  return rows;
}
// 챌린지 책 변경
async function deletechallengeBook2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeBook2Query = `
  update Challenge
  SET status = 'N'
  WHERE goalbookId = ${goalBookId}`;
  const [rows] = await connection.query(patchchallengeBook2Query);
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
// 오늘 읽은 책하나 총 시간
async function getbookTime(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Challenge.goalId, Book.title, sum(time) as sumtime, Challenge.userId
  from Challenge
  inner join Goal_book on Goal_book.goalBookId = Challenge.goalBookId
  inner join Book on Book.bookId = Goal_book.bookId
  where Challenge.goalBookId = ${goalBookId} && curdate() = DATE_FORMAT(Challenge.createAt, '%Y-%m-%d')
  group by Goal_book.goalBookId`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 연속도서일 조회
async function getcontinuity(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  await connection.beginTransaction();
  const getchallenge1Query = `
  SELECT goalId, date_format(createAt, '%Y-%m-%d') as createAt, COUNT(row_num)
  FROM (
SELECT goalId, createAt, goalBookId, @var:=@var+1 AS row_num, date_format(ADDDATE(createAt, -@var), '%Y-%m-%d') AS group_date
    FROM (
      SELECT @var:=0, a.goalId, a.createAt, goalBookId
      FROM Challenge AS a
      RIGHT JOIN Goal AS b ON a.goalId = b.goalId
      WHERE a.createAt >= b.createAt && a.goalId = ${goalId}
      GROUP BY a.goalId, DATE(a.createAt)
      ORDER BY a.goalId    ) AS aa
    GROUP BY goalId, DATE(createAt)
  ) AS bb
  GROUP BY goalId, group_date
  order by bb.createAt desc limit 1`;
  const [rows] = await connection.query(getchallenge1Query);
  await connection.commit();
  connection.release();
  return rows;
}
// 현황 조회
async function getcontinuity2(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  await connection.beginTransaction();
  const getchallenge1Query = `
  select count(Reading_journal.journalId) as sumjournal,
  (select sum(time)
      from Challenge
      where date_format(createAt, '%Y-%m-%d') = date_format(now(), '%Y-%m-%d')
      group by goalId = ${goalId}) as todayTime,
  (select sum(charPercent)
      from Challenge
      where date_format(createAt, '%Y-%m-%d') = date_format(now(), '%Y-%m-%d')
      group by goalId = ${goalId}) as todayPercent,
  date_format(Goal.createAt, '%Y-%m-%d') as startAt,
  date_format(Goal.expriodAt, '%Y-%m-%d') as expriodAt,
  period, amount,
  (select count(Challenge.percent)
      from Challenge
      where goalId = ${goalId} && percent = 100
      group by goalId) as sumAmount,
  User.name,
  TO_DAYS(Goal.expriodAt) - TO_DAYS(curdate()) as Dday
from Challenge
inner join Reading_journal on Challenge.challengeId = Reading_journal.challengeId
inner join Goal on Challenge.goalId = Goal.goalId
inner join User on User.userId = Goal.userId
where Challenge.goalId = ${goalId}
group by Challenge.goalId`;
  const [rows] = await connection.query(getchallenge1Query);
  await connection.commit();
  connection.release();
  return rows;
}

//해당 목표가 존재하는가? --Heather
async function isValidGoalId(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const validQuery = `
    SELECT EXISTS(SELECT goalId FROM Goal WHERE goalId = ?) as exist;
  `;
  const [rows] = await connection.query(validQuery, goalId);
  connection.release();
  return rows;
}

//이미 달성한 목표인가? --Heather
async function isAchieved(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `SELECT EXISTS(SELECT goalId FROM Goal WHERE goalId = ? AND isComplete = 1) as exist`;
  const [rows] = await connection.query(query, goalId);
  connection.release();
  return rows;
}

//목표의 유저id는 누구인가? --Heather
async function whoIsOwner(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `SELECT userId FROM Goal WHERE goalId = ?`;
  const [rows] = await connection.query(query, goalId);
  connection.release();
  return rows;
}


//목표 달성 시 케이크 종류와 isComplete 1로 변경 --Heather
async function postCake(cake, goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `UPDATE Goal SET cake = ?, isComplete = 1 WHERE goalId = ?`;
  const postParams = [cake, goalId];
  const [rows] = await connection.query(query, postParams);
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
  getbookTime,
  getcontinuity,
  getcontinuity2,
  patchchallengeBook2,
  deletechallengeBook2,
  isValidGoalId,
  isAchieved,
  whoIsOwner,
  postCake,
};
