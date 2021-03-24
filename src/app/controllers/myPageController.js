const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const myPageDao = require("../dao/myPageDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");


/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 프로필 등록/수정
 */
exports.profile = async function (req, res) {

  try {
    const { name, profilePictureURL, vow } = req.body;

    if (name === undefined || vow === undefined) {
      return res.json({
        isSuccess: false,
        code: 2027,
        message: "이름과 한줄다짐을 모두 입력해주세요.",
      });
    }

    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      if (name === "Reader") {
        return res.json({
          isSuccess: false,
          code: 3001,
          message: "초기 닉네임은 Reader 입니다. 나만의 닉네임을 설정해주세요.",
        });
      }

      if(name.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2025,
          message: "닉네임의 최대 길이는 30자입니다.",
        });
      }

      const isDuplicatedName = await myPageDao.isDuplicatedName(name);
      if(isDuplicatedName[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "이미 사용중인 닉네임입니다.",
        });
      }

      if(vow.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "한줄다짐의 최대 길이는 30자입니다.",
        });
      }

      const profileParams = [name, profilePictureURL, vow, userId];
      const isSameProfile = await myPageDao.isSameProfile(profileParams);

      if(isSameProfile[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2028,
          message: "변경사항이 없습니다.",
        });
      }

      await myPageDao.postProfile(profileParams);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "프로필 등록/변경 성공",
      });

    } catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "프로필 등록/변경 실패",
      });
    }

  } catch (err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.19.FRI
 * API 기 능 : 프로필 수정 시 닉네임 중복검사
 */
exports.isDuplicatedName = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {

      const name = req.body.name;
      if (name === "Reader") {
        return res.json({
          isSuccess: false,
          code: 3001,
          message: "초기 닉네임은 Reader 입니다. 나만의 닉네임을 설정해주세요.",
        });
      }

      if(name.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2025,
          message: "닉네임의 최대 길이는 30자입니다.",
        });
      }

      const isDuplicatedName = await myPageDao.isDuplicatedName(name);
      if(isDuplicatedName[0].exist === 0) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "사용가능한 닉네임입니다.",
        });
      } else {
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "이미 사용중인 닉네임입니다.",
        });
      }

    }  catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "닉네임 중복검사 실패",
      });
    }

  } catch (err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
}

/*
 * 최종 수정일 : 2021.03.20.SAT
 * API 기 능 : 내 프로필 조회
 */
exports.getProfile = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const myProfile = await myPageDao.getMyProfile(userId);
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "프로필 조회 성공",
        results: myProfile[0],
      });

    } catch (err) {
      logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "프로필 조회 실패",
      });
    }

  } catch(err) {
    logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.24.WED
 * API 기 능 : 나의 피스 조회
 */
exports.getPieces = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const myPieces = await myPageDao.getMyPieces(userId);
      if(myPieces.length < 1) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "등록한 챌린지가 없습니다. 챌린지를 등록해보세요.",
        });
      }
      else {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "나의 피스 조회 성공.",
          results: myPieces,
        });
      }

    } catch (err) {
      logger.error(`getPieces - non transaction Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "나의 피스 조회 실패",
      });
    }
  } catch (err) {
    logger.error(`getPieces - non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
}