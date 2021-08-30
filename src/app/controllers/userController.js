const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
const reviewDao = require("../dao/reviewDao");
const myPageDao = require("../dao/myPageDao");
const { constants } = require("buffer");

/**
 update : 2021.03.16
 01.signUp API = 회원가입
 */
exports.signUp = async function (req, res) {
  const { email, password } = req.body;

  const nickname = "Reader";

  if (!email)
    return res.json({
      isSuccess: false,
      code: 301,
      message: "이메일을 입력해주세요.",
    });

  if (email.length > 30)
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "이메일은 30자리 미만으로 입력해주세요.",
    });

  if (!regexEmail.test(email))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  if (!password)
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "비밀번호를 입력 해주세요.",
    });

  if (password.length < 6 || password.length > 20)
    return res.json({
      isSuccess: false,
      code: 2004,
      message: "비밀번호는 6~20자리를 입력해주세요.",
    });

  try {
    // 이메일 중복 확인
    const emailRows = await userDao.userEmailCheck(email);
    if (emailRows[0].exist === 1) {
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "중복된 이메일입니다.",
      });
    }

    // TRANSACTION : advanced
    // await connection.beginTransaction(); // START TRANSACTION
    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    const insertUserInfoParams = [email, hashedPassword, nickname];
    await userDao.insertUserInfo(insertUserInfoParams);


    const [userInfoRows] = await userDao.selectUserInfo(email);
    let token = await jwt.sign(
      {
        id: userInfoRows[0].userId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀 키
      {
        expiresIn: "90d",
        subject: "userInfo",
      } // 유효 시간은 90일
    );


    //  await connection.commit(); // COMMIT
    // connection.release();
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "회원가입 성공",
      jwt: token,
    });
  } catch (err) {
    // await connection.rollback(); // ROLLBACK
    // connection.release();
    logger.error(`SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

/**
 update : 2021.03.16
 02.signIn API = 로그인
 **/
exports.signIn = async function (req, res) {
  const { email, password } = req.body;

  if (!email)
    return res.json({
      isSuccess: false,
      code: 301,
      message: "이메일을 입력해주세요.",
    });

  if (email.length > 30)
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "이메일은 30자리 미만으로 입력해주세요.",
    });

  if (!regexEmail.test(email))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  if (!password)
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "비밀번호를 입력해주세요.",
    });

  try {
    const [userInfoRows] = await userDao.selectUserInfo(email);

    if (userInfoRows.length < 1) {
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "아이디를 확인해주세요.",
      });
    }

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");
    if (userInfoRows[0].password !== hashedPassword) {
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 2007,
        message: "비밀번호를 확인해주세요.",
      });
    }
    if (userInfoRows[0].status === "REST") {
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 2008,
        message: "비활성화된 계정입니다. 고객센터에 문의해주세요.",
      });
    } else if (userInfoRows[0].status === "DELETE") {
      //connection.release();
      return res.json({
        isSuccess: false,
        code: 2009,
        message: "탈퇴된 계정입니다. 고객센터에 문의해주세요.",
      });
    }
    //토큰 생성
    let token = await jwt.sign(
      {
        id: userInfoRows[0].userId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀 키
      {
        expiresIn: "90d",
        subject: "userInfo",
      } // 유효 시간은 90일
    );

    //달성하지 않은 목표가 존재하니?
    const isExistNotUnAchievedGoal = await userDao.isExistNotUnAchievedGoal(
      email
    );

    if (isExistNotUnAchievedGoal[0].exist === 1) {
      //달성하지 않은 목표 있음(result:1) -> 메인 이동 불필요
      res.json({
        isSuccess: true,
        code: 1000,
        message: "로그인 성공",
        result: 1,
        jwt: token,
      });
    } else {
      //목표 다 달성했음(result:0) => 메인으로 이동해야 함
      res.json({
        isSuccess: true,
        code: 1000,
        message: "로그인 성공",
        result: 0,
        jwt: token,
      });
    }
    //connection.release();
  } catch (err) {
    logger.error(`SignIn Query error\n: ${JSON.stringify(err)}`);
    //connection.release();
    return false;
  }
};

/**
 update : 2021.03.24
 API 기능 : token 검증
 **/
exports.check = async function (req, res) {
  const iat = new Date(req.verifiedToken.iat * 1000).toLocaleString();
  const exp = new Date(req.verifiedToken.exp * 1000).toLocaleString();

  res.json({
    isSuccess: true,
    code: 1000,
    message: "검증 성공",
    userId: req.verifiedToken.id,
    iat: iat,
    exp: exp,
  });
};

/*
 * 최종 수정일 : 2021.03.28.SUN
 * API 기 능 : 회원 탈퇴
 */
exports.bye = async function (req, res) {
  const userId = req.verifiedToken.id;
  const userRows = await userDao.getuser(userId);
  if (userRows[0] === undefined)
    return res.json({
      isSuccess: false,
      code: 4020,
      message: "가입되어있지 않은 유저입니다.",
    });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction(); // 트랜잭션 적용 시작
    await userDao.byeUser(userId);
    await userDao.byeReview(userId);
    await userDao.byeChallenge(userId);
    await conn.commit(); // 커밋

    const isCompletedDelete = await userDao.isCompletedDelete(userId);
    if (isCompletedDelete[0].exist === 1) {
      return res.json({
        isSuccess: false,
        code: 2034,
        message: "탈퇴가 완료되지 않았습니다.",
      });
    } else if (isCompletedDelete[0].exist === 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "탈퇴 성공",
      });
    } else {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "탈퇴 성공",
      });
    }
  } catch (err) {
    logger.error(`Bye - non transaction Query error\n: ${JSON.stringify(err)}`);
    await conn.rollback();
    return res.json({
      isSuccess: false,
      code: 500,
      message: "탈퇴 실패",
    });
  } finally {
    conn.release(); // conn 회수
  }
};

exports.isReader = async function (req, res) {
  const userId = req.verifiedToken.id;
  const userRows = await userDao.getuser(userId);
  if (userRows[0] === undefined)
    return res.json({
      isSuccess: false,
      code: 4020,
      message: "가입되어있지 않은 유저입니다.",
    });

  try {
    const whatIsYourName = await reviewDao.whatIsYourName(userId);
    if (whatIsYourName[0].name === "Reader") {
      return res.json({
        isSuccess: false,
        code: 3001,
        message: "닉네임을 설정해주세요.",
      });
    } else
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "나만의 이름이 등록되어 있습니다.",
      });
  } catch (err) {
    logger.error(
      `checkName - non transaction Query error\n: ${JSON.stringify(err)}`
    );
    return res.json({
      isSuccess: false,
      code: 500,
      message: "이름 조회 실패",
    });
  }
};

/*
 * update : 2021.03.31.WED
 * join API : 회원가입(이름 필요)
 */
exports.join = async function (req, res) {
  const { email, password, name } = req.body;

  const nickname = name;

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

  if (!email)
    return res.json({
      isSuccess: false,
      code: 301,
      message: "이메일을 입력해주세요.",
    });

  if (email.length > 30)
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "이메일은 30자리 미만으로 입력해주세요.",
    });

  if (!regexEmail.test(email))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  if (!password)
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "비밀번호를 입력해주세요.",
    });

  if (password.length < 6 || password.length > 20)
    return res.json({
      isSuccess: false,
      code: 2004,
      message: "비밀번호는 6~20자리를 입력해주세요.",
    });

  try {
    // 이메일 중복 확인
    const emailRows = await userDao.userEmailCheck(email);
    if (emailRows[0].exist === 1) {
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "중복된 이메일입니다.",
      });
    }

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    const insertUserInfoParams = [email, hashedPassword, nickname];
    await userDao.insertUserInfo(insertUserInfoParams);

    const [userInfoRows] = await userDao.selectUserInfo(email);
    let token = await jwt.sign(
      {
        id: userInfoRows[0].userId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀 키
      {
        expiresIn: "90d",
        subject: "userInfo",
      } // 유효 시간은 90일
    );

    return res.json({
      isSuccess: true,
      code: 1000,
      message: "회원가입 성공",
      jwt: token,
    });
  } catch (err) {
    logger.error(`join - Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

/*
 * 최종 수정일 : 2021.03.31.WED
 * API 기 능 : 회원가입 시 닉네임 중복검사
 */
exports.isDuplicated = async function (req, res) {
  try {
    const name = req.query.name;

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
    } else {
      return res.json({
        isSuccess: false,
        code: 2026,
        message: "이미 사용중인 닉네임입니다.",
      });
    }
  } catch (err) {
    logger.error(`join:DuplicatedName - non transaction Query error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 500,
      message: "닉네임 중복검사 실패",
    });
  }
};