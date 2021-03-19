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
module.exports = {
  postjournals,
  postjournals2,
  getgoalBookId,
  patchjournals,
  deletejournals,
};
