const { pool } = require("../../../config/database");

async function postProfile(profileParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
    UPDATE User SET name = ?, profilePictureURL = ?, vow = ? WHERE userId = ?;
                 `;

  const [profileRows] = await connection.query(profileQuery, profileParams);
  connection.release();
  return profileRows;
}

async function isSameProfile(profileParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
    SELECT EXISTS(SELECT * FROM User WHERE name = ? AND profilePictureURL = ? AND vow = ? AND userId = ?) as exist;
                 `;

  const [profileRows] = await connection.query(profileQuery, profileParams);
  connection.release();
  return profileRows;
}

async function isDuplicatedName(name) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
    SELECT EXISTS(SELECT * FROM User WHERE name = ?) as exist;
                 `;

  const [profileRows] = await connection.query(profileQuery, name);
  connection.release();
  return profileRows;
}

async function getMyProfile(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
    SELECT name, IFNULL(vow, '작성한 문장이 없습니다.') as vow, IFNULL(profilePictureURL, '사진이 없습니다.') as profilePictureURL FROM User WHERE userId = ?;
                 `;
  const [profileRows] = await connection.query(profileQuery, userId);
  connection.release();
  return profileRows;
}

module.exports = {
  postProfile,
  isSameProfile,
  isDuplicatedName,
  getMyProfile,
};
