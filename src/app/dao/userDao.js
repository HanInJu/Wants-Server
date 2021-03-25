const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
    SELECT EXISTS(SELECT email, name FROM User WHERE email = ?) as exist;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}

async function userNicknameCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT email, name 
                FROM User
                WHERE name = ?;
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
    INSERT INTO User(email,password,name) VALUES(?,?,?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}

//SignIn
async function selectUserInfo(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT userId, email , password, name, status 
                FROM User 
                WHERE email = ?;
                `;

  let selectUserInfoParams = [email];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [userInfoRows];
}
// 유저가 실제 존재하는지 확인
async function getuser(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getuserQuery = `
  select *
from User
where userId = ${userId};
`;

  const [getuserRows] = await connection.query(getuserQuery);
  connection.release();

  return getuserRows;
}
module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  selectUserInfo,
  getuser,
};
