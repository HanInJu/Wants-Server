const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
const passwordDao = require("../dao/passwordDao");
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

    try {
      const insertUserInfoParams = [email, hashedPassword, nickname];
      await userDao.insertUserInfo(insertUserInfoParams);
    } catch (err) {
      return res.json({
        isSuccess: false,
        code: 6000,
        message: "insert 에러",
      });
    }
    // const insertUserInfoParams = [email, hashedPassword, nickname];
    // await userDao.insertUserInfo(insertUserInfoParams); 여기가 원래

    try {
      const [userInfoRows] = await userDao.selectUserInfo(email);
    } catch (err) {
      return res.json({
        isSuccess: false,
        code: 6000,
        message: "userInfoRows 에러",
      });
    }
    // const [userInfoRows] = await userDao.selectUserInfo(email); //여기가 원래

    try  {
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
      return res.json({
        isSuccess: false,
        code: 6000,
        message: "token 에러",
      });
    }

  } catch (err) {
    // await connection.rollback(); // ROLLBACK
    // connection.release();
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
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
