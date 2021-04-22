//const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const myPageDao = require("../dao/myPageDao");
const reviewDao = require("../dao/reviewDao");
const challengeDao = require("../dao/challengeDao");
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
    //const connection = await pool.getConnection(async (conn) => conn);

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

      if (name.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2025,
          message: "닉네임의 최대 길이는 30자입니다.",
        });
      }

      const isDuplicatedName = await myPageDao.isDuplicatedName(name);
      if (isDuplicatedName[0].exist === 1) {
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "이미 사용중인 닉네임입니다.",
        });
      }

      if (vow.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "한줄다짐의 최대 길이는 30자입니다.",
        });
      }

      const profileParams = [name, profilePictureURL, vow, userId];
      const isSameProfile = await myPageDao.isSameProfile(profileParams);

      if (isSameProfile[0].exist === 1) {
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
      logger.error(
        `register Profile - non transaction Query error\n: ${JSON.stringify(
          err
        )}`
      );
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "프로필 등록/변경 실패",
      });
    }
  } catch (err) {
    logger.error(
      `register Profile:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(
        err
      )}`
    );
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
    //const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const name = req.param("name");
      if (name === "Reader") {
        return res.json({
          isSuccess: false,
          code: 3001,
          message: "초기 닉네임은 Reader 입니다. 나만의 닉네임을 설정해주세요.",
        });
      }

      if (name.length > 30) {
        return res.json({
          isSuccess: false,
          code: 2025,
          message: "닉네임의 최대 길이는 30자입니다.",
        });
      }

      const isDuplicatedName = await myPageDao.isDuplicatedName(name);
      if (isDuplicatedName[0].exist === 0) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "사용가능한 닉네임입니다.",
        });
      } else { //여기서 원래 자기가 쓰던 이름으로 변경하는 건 제외해줘야 하므로, 이 부분 수정하기!
        return res.json({
          isSuccess: false,
          code: 2026,
          message: "이미 사용중인 닉네임입니다.",
        });
      }
    } catch (err) {
      logger.error(
        `reviseProfile - non transaction Query error\n: ${JSON.stringify(err)}`
      );
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "닉네임 중복검사 실패",
      });
    }
  } catch (err) {
    logger.error(
      `reviseProfile:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(
        err
      )}`
    );
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.20.SAT
 * API 기 능 : 내 프로필 조회
 */
exports.getProfile = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    //const connection = await pool.getConnection(async (conn) => conn);

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
      logger.error(
        `getProfile - non transaction Query error\n: ${JSON.stringify(err)}`
      );
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "프로필 조회 실패",
      });
    }
  } catch (err) {
    logger.error(
      `getProfile:NOT signIn USER -  non transaction DB Connection error\n: ${JSON.stringify(
        err
      )}`
    );
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
    //const connection = await pool.getConnection(async (conn) => conn);

    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    try {
      const myPieces = await myPageDao.getMyPieces(userId);

      if (myPieces.length < 1) {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "등록한 챌린지가 없습니다. 챌린지를 등록해보세요.",
        });
      } else {
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "나의 피스 조회 성공.",
          results: myPieces,
        });
      }
    } catch (err) {
      logger.error(
        `getPieces - non transaction Query error\n: ${JSON.stringify(err)}`
      );
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 500,
        message: "나의 피스 조회 실패",
      });
    }
  } catch (err) {
    logger.error(
      `getPieces:NOT signIn USER - non transaction DB Connection error\n: ${JSON.stringify(
        err
      )}`
    );
    return false;
  }
};

//독서통계
exports.getinfo = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;

    const userRows = await userDao.getuser(jwt);

    //const connection = await pool.getConnection(async (conn) => conn);

    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    const getgoalIdRows = await challengeDao.getgoalId(jwt);

    if (getgoalIdRows.length > 0) {
      var getcontinuityRows = await challengeDao.getcontinuity(
        getgoalIdRows[0].goalId
      ); // 연속된 시간 구함
    } else {
      var getcontinuityRows = null;
    }

    const getReadingInfoRows = await myPageDao.getReadingInfo(jwt);

    console.log(getReadingInfoRows);

    if (getReadingInfoRows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "독서통계 조회 성공",
        getcontinuityRows,
        getReadingInfoRows,
      });
    } else if (getReadingInfoRows.length === 0) {
    }
  } catch (err) {
    logger.error(
      `getInfo - non transaction DB Connection error\n: ${JSON.stringify(err)}`
    );
    return false;
  }
};

/*
 * 최종 수정일 : 2021.03.24.WED
 * API 기 능 : 나의 도서통계 중 그래프 정보 조회
 */
exports.getgraph = async function (req, res) {
  try {
    const userId = req.verifiedToken.id;
    //const connection = await pool.getConnection(async (conn) => conn);
    console.log("독서그래프");
    var jwt = req.verifiedToken.id;
    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });

    var year = req.query.year;
    const getgraphRows = await myPageDao.getgraph(userId, year);

    if (getgraphRows.length > 0 || getgraphRows != undefined) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "나의 독서그래프 조회 성공",
        result: getgraphRows,
      });
    } else if (getgraphRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2229,
        message: "불러올 독서그래프가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "나의 독서그래프 조회 실패",
      });
  } catch (err) {
    logger.error(`getGraph - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

/*
 * 최종 수정일 : 2021.04.22
 * API 기 능 : uri 조회
 */
exports.geturi = async function (req, res) {
  try {
    var jwt = req.verifiedToken.id;
    const userRows = await userDao.getuser(jwt);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
      });
    const uriId = req.params.uriId;
    const geturiRows = await myPageDao.geturi(uriId);

    if (geturiRows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "uri 조회 성공",
        result: geturiRows,
      });
    } else if (geturiRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2400,
        message: "가져올 uri가 없습니다.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "uri 조회 실패",
      });
  } catch (err) {
    logger.error(`getGraph - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
