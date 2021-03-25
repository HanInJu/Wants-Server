const { pool } = require("../../../config/database");

// 유저가 실제 존재하는지 확인
async function getuser(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getuserQuery = `
  s
`;

  const [getuserRows] = await connection.query(getuserQuery);
  connection.release();

  return getuserRows;
}
module.exports = {
  getuser,
};
