const { pool } = require("../../../config/database");

// 유저가 실제 존재하는지 확인
async function isExistEmail(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT EXISTS(SELECT email FROM User WHERE email = ?) as exist;
                 `;
  const [rows] = await connection.query(query, email);
  connection.release();
  return rows;
}

async function updateUserInfo(updateUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    UPDATE User SET password = ? WHERE email = ?;
    `;
  const [row] = await connection.query(query, updateUserInfoParams);
  connection.release();
  return row;
}

async function updateUserPW(userInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    UPDATE User SET password = ? WHERE userId = ?;
    `;
  const [row] = await connection.query(query, userInfoParams);
  connection.release();
  return row;
}

async function isSamePW(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT password FROM User WHERE userId = ?;
    `;
  const [row] = await connection.query(query, userId);
  connection.release();
  return row;
}

module.exports = {
  isExistEmail,
  updateUserInfo,
  updateUserPW,
  isSamePW,
};
