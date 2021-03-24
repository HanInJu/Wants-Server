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

async function getMyPieces(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const profileQuery = `
    SELECT goalId, IF(isComplete = 1, '달성', '미완성') as isComplete, cake,
           CONCAT((CASE WHEN period = 'D' THEN '일주일'
                        WHEN period = 'M' THEN '한 달'
                        WHEN period = 'Y' THEN '1년' END), '에 ', amount, '권 챌린지') as challengeName,
           CONCAT(DATE_FORMAT(createAt, '%Y.%m.%d'), ' - ', DATE_FORMAT(expriodAt, '%Y.%m.%d')) as challengePeriod,
           IF(isComplete = 1, '홀케이크', '표시없음') as wholeCake
    FROM Goal
    WHERE userId = ?;
                 `;
  const [profileRows] = await connection.query(profileQuery, userId);
  connection.release();
  return profileRows;
}

async function getReadingInfo(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    
                 `;
  const [rows] = await connection.query(query, userId);
  connection.release();
  return rows;
}

async function getReadingGraph(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    
                 `;
  const [rows] = await connection.query(query, userId);
  connection.release();
  return rows;
}

module.exports = {
  postProfile,
  isSameProfile,
  isDuplicatedName,
  getMyProfile,
  getMyPieces,
  getReadingInfo,
  getReadingGraph,
};
