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

async function byeUser(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    DELETE User, Rs FROM User INNER JOIN Recent_search Rs on User.userId = Rs.userId WHERE User.userId = ?;
                `;
  const [rows] = await connection.query(query, userId);
  connection.release();
  return rows;
}

async function byeReview(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    DELETE R, Rl, Rr, Rc, Rcr
    FROM Review R
    LEFT JOIN Review_like Rl on R.userId = Rl.userId OR R.reviewId = Rl.reviewId
    LEFT JOIN Review_report Rr on R.userId = Rr.userId OR R.reviewId = Rr.reviewId
    LEFT JOIN Review_comment Rc on R.userId = Rc.userId OR Rc.reviewId = R.reviewId
    LEFT JOiN Review_comment_report Rcr on R.userId = Rcr.userId OR Rcr.commentId = Rc.commentId
    WHERE R.userId = ?;
                `;
  const [rows] = await connection.query(query, userId);
  connection.release();
  return rows;
}

async function byeChallenge(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    DELETE G, Gb, C, Rj
    FROM Goal G
    INNER JOIN Goal_book Gb on G.goalId = Gb.goalId
    INNER JOIN Challenge C on G.userId = C.userId
    LEFT JOIN Reading_journal Rj on G.goalId = Rj.goalId
    WHERE G.userId = ?;         
                `;
  const [rows] = await connection.query(query, userId);
  connection.release();
  return rows;
}

async function isExistNotUnAchievedGoal(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const query = `
    SELECT EXISTS(SELECT goalId
                  FROM Goal
                  INNER JOIN User U on Goal.userId = U.userId
                  WHERE U.email = ? AND isComplete = 0) as exist;
    `;
  const [row] = await connection.query(query, userId);
  connection.release();
  return row;
}

module.exports = {
  userEmailCheck,
  insertUserInfo,
  selectUserInfo,
  getuser,
  byeUser,
  byeReview,
  byeChallenge,
  isExistNotUnAchievedGoal,
};
