const { pool } = require("../../../config/database");

async function like(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
                 SELECT name FROM User WHERE userId = ?;
                 `;

  const profileParams = [userId];
  const [profileRows] = await connection.query(profileQuery, profileParams);

  connection.release();
  return profileRows;
}

module.exports = {
  like,
};
