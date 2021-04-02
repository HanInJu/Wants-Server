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
// 책있는지 확인
async function getbook2(bookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select *
  from Book
  where bookId = '${bookId}'`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 목표책추가
// async function postchallengeBook(goalId, publishNumber) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const postchallengeQuery = `
//   insert into Goal_book(goalId, publishNumber)
//   value (${goalId}, '${publishNumber}')`;
//
//   const [rows] = await connection.query(postchallengeQuery);
//   connection.release();
//   return rows;
// }
/*
 * Goal_book 테이블에 목표책 추가하기
 * Heather
 */
async function postchallengeBook(goalId, bookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
  INSERT INTO Goal_book(goalId, bookId) VALUES(?,?);
                              `;
  const bookParams = [goalId, bookId];
  const [rows] = await connection.query(query, bookParams);
  connection.release();
  return rows;
}

// 오늘의 챌린지 조회1
async function getchallenge1(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Goal_book.reading, Goal.isComplete,
  Goal.goalId as goalId,
  Book.bookId,
  Book.title,
  Book.writer,
  Book.imageURL,
  Book.publishNumber,
  Goal_book.goalBookId
from Goal
    inner join Goal_book on Goal.goalId = Goal_book.goalId
    inner join (select title, writer, imageURL, publishNumber, bookId from Book) Book
               on Book.bookId = Goal_book.bookId
where Goal.goalId = ${goalId}`;

  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회2
async function getchallenge2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge2Query = `
  select a.goalBookId, a.page, a.percent, a.time
  from (select goalBookId, page, percent, sum(time) as time
        from Challenge
        where goalBookId = ${goalBookId} && status = 'Y'
        order by createAt DESC
        limit 1) a
  group by goalBookId;`;

  const [rows] = await connection.query(getchallenge2Query);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회3 // 오늘 독서시간 및 작성일지 조회
async function getchallenge3(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge2Query = `
  select (select sum(time)
  from Challenge
  where goalId = ${goalId} && date_format(createAt, '%Y-%m-%d') = date_format(now(), '%Y-%m-%d') && Challenge.status = 'Y'
  group by goalId) as todayTime,
       amount, Goal.time, period, User.userId,
  (select ifnull(count(Challenge.percent), 0)
      from Challenge
      where goalId = ${goalId} && percent = 100 && Challenge.status = 'Y'
      group by goalId) as sumAmount,
  User.name, date_format(Goal.expriodAt, '%Y.%m.%d') as expriodAt,
  TO_DAYS(Goal.expriodAt) - TO_DAYS(curdate()) as Dday, sumJournal, a.challengeId
from Goal
inner join User on User.userId = Goal.userId,
     (select count(Reading_journal.journalId) as sumJournal, Challenge.challengeId from Challenge
inner join Reading_journal on Challenge.challengeId = Reading_journal.challengeId
         where Challenge.goalId = ${goalId}) a
where Goal.goalId = ${goalId}
group by Goal.goalId`;

  const [rows] = await connection.query(getchallenge2Query);
  connection.release();
  return rows;
}
// 챌린지 중복책인지 조회
async function getgoalbook(bookId, goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select *
  from Goal_book
  where bookId = '${bookId}' && goalId = ${goalId}`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 챌린지 책 변경
async function patchchallengeBook(bookId, goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const patchchallengeBookQuery = `
  UPDATE Goal_book
  SET bookId = '${bookId}'
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
  select userId, Goal_book.goalId
from Goal_book
inner join Goal on Goal_book.goalId = Goal.goalId
where goalBookId = ${goalBookId} && userId = ${jwt};`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
// 가지고있는챌린지 책 수
async function countgoalBookId(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select count(goalBookId) as goalBookId
  from Goal_book
  where goalId = ${goalId}`;

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
  and (now() between createAt and Goal.expriodAt)`;

  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 오늘의 챌린지 조회2
async function getgoalId2(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select *
  from Goal
  where userId = ${userId}
  order by expriodAt asc limit 1`;

  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 오늘 읽은 책하나 총 시간
async function getbookTime(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Challenge.goalId, Book.title, sum(Challenge.time) as sumtime, Challenge.userId, Goal.time
  from Challenge
  inner join Goal_book on Goal_book.goalBookId = Challenge.goalBookId
  inner join Book on Book.bookId = Goal_book.bookId
  inner join Goal on Goal_book.goalId = Goal.goalId
  where Challenge.goalBookId = ${goalBookId} && curdate() = DATE_FORMAT(Challenge.createAt, '%Y.%m.%d')
  group by Goal_book.goalBookId`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 오늘 읽은 책
async function getbookTime2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Book.title, Goal.time
  from Goal_book
  inner join Goal on Goal_book.goalId = Goal.goalId
  inner join Book on Book.bookId = Goal_book.bookId
  where Goal_book.goalBookId = ${goalBookId}
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
  SELECT goalId, date_format(createAt, '%Y.%m.%d') as createAt, count(row_num) as countDay
  FROM (
SELECT goalId, createAt, goalBookId, @var:=@var+1 AS row_num, date_format(ADDDATE(createAt, -@var), '%Y-%m-%d') AS group_date
    FROM (
      SELECT @var:=0, a.goalId, a.createAt, goalBookId
      FROM Challenge AS a
      RIGHT JOIN Goal AS b ON a.goalId = b.goalId
      WHERE a.goalId = ${goalId}
      GROUP BY a.goalId, DATE(a.createAt)
      ORDER BY createAt ASC    ) AS aa
    GROUP BY goalId, DATE(createAt)
  ) AS bb
  GROUP BY goalId, group_date
ORDER BY createAt DESC limit 1`;
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
  where goalId = ${goalId} && date_format(createAt, '%Y-%m-%d') = date_format(now(), '%Y-%m-%d')
  group by goalId) as todayTime,
  (select sum(Challenge.charPercent)
  from Challenge
  where goalId = ${goalId} && date_format(createAt, '%Y-%m-%d') = date_format(now(), '%Y-%m-%d')
  group by goalId) as todayPercent,
  date_format(Goal.createAt, '%Y.%m.%d') as startAt,
  date_format(Goal.expriodAt, '%Y.%m.%d') as expriodAt,
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

//직전 목표 달성 시 부여됐던 케이크 종류 --Heather
async function getBeforeCake(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT CASE WHEN GS.isComplete = 1 THEN GS.cake
                WHEN GS.isComplete = 0 THEN '이전에 달성한 챌린지가 없으므로 직전에 부여된 케이크가 없습니다.'
             END as cake
    FROM Goal
           INNER JOIN (SELECT goalId, cake, isComplete
                       FROM Goal
                       WHERE userId = ?
                       ORDER BY completedAt DESC
                       LIMIT 1) GS on Goal.goalId = GS.goalId;
        `;
  const [row] = await connection.query(query, userId);
  connection.release();
  return row;
}

// 도전책조회
// async function getbookList(goalId) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const getchallenge1Query = `
//   select title, imageURL, writer, goalBookId, reading
//   from Goal_book
//   inner join Book on Book.bookId = Goal_book.bookId
//   where Goal_book.goalId = ${goalId}`;
//   const [rows] = await connection.query(getchallenge1Query);
//   connection.release();
//   return rows;
// }
/*
 * 도전 중인 책과 도전중이 아닌 책 조회
 */
async function getbookList(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
  SELECT IF(reading = 'Y', true, false) as reading, status, Book.bookId, title, imageURL, writer, goalBookId
  FROM Goal_book
  INNER JOIN Book on Book.bookId = Goal_book.bookId
  WHERE goalId = ${goalId}
                            `;
  const [rows] = await connection.query(query, goalId);
  connection.release();
  return rows;
}

// 기존의 도전중인 책 인덱스 찾기
async function getgoalBookId(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select Goal_book.goalBookId as goalBookId
  from (select goalId, goalBookId, Goal_book.reading from Goal_book where goalBookId = ${goalBookId}) a,
       Goal_book
  where Goal_book.goalId = a.goalId && Goal_book.reading = 'Y'`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 기존의 도전중인 책 인덱스 찾기
async function getgoalBookId2(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select goalBookId
  from Goal_book
  where goalId = ${goalId} && Goal_book.reading = 'Y'`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 기존의 도전중인 책 비활
async function patchgoalBookId(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  update Goal_book SET reading = 'N'
  where goalBookId = ${goalBookId}`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}

// 새롭게 도전할 책 활성화
async function patchgoalBookId2(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  update Goal_book SET reading = 'Y'
  where goalBookId = ${goalBookId}`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}

// 새롭게 도전할 책 활성화
async function getYN(goalBookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select case aa.reading
  when 1 then 'O'
  else 'X'
  end as isYN
from (select count(Goal_book.reading) as reading
from (select goalId, goalBookId from Goal_book where goalBookId = ${goalBookId}) a,
  Goal_book
where Goal_book.goalId = a.goalId && reading = 'Y') aa`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}

// 목표로 정한 권수 부르기
async function getgoalamount(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select amount
  from Goal
  where goalId = ${goalId}`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 이미저장된 책 수
async function getcountBook(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select count(Goal_book.bookId) as countBook from Goal_book
  where goalId = ${goalId}`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 만료된 챌린지 만료일 재설정
async function patchexpriodAt(goalId, expriodAt) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  update Goal
  SET expriodAt = '${expriodAt}'
  where goalId = ${goalId};`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 완독한 책 몇개인지
async function Goal_bookstatus(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  select count(goalBookId) as goalBookId
  from Goal_book
  where Goal_book.status = 'Y' && goalId = ${goalId}`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
// 완독한 책이랑 목표책 같으면 목표 다했다는 표시
async function patchComplete(goalId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getchallenge1Query = `
  update Goal
  SET isComplete = 1
  where goalId = ${goalId};`;
  const [rows] = await connection.query(getchallenge1Query);
  connection.release();
  return rows;
}
module.exports = {
  getcountBook,
  getgoalamount,
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
  getBeforeCake,
  getgoalId2,
  getbookList,
  getgoalBookId,
  patchgoalBookId,
  patchgoalBookId2,
  getYN,
  getbookTime2,
  patchexpriodAt,
  Goal_bookstatus,
  patchComplete,
  getgoalBookId2,
  countgoalBookId,
  getbook2,
};
