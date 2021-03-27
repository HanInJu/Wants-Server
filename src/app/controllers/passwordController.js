const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
const passwordDao = require("../dao/passwordDao");
const { constants } = require("buffer");

/*
 * 최종 수정일 : 2021.03.27.SAT
 * API 기 능 : 비밀번호 찾기
 */
exports.sendEmail = async function (req, res) {
  const email = req.body;

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

  try {
    // 해당 이메일로 가입된 정보가 있는지 확인
    const emailRows = await userDao.userEmailCheck(email);

    if (emailRows[0].exist === 1) {


      return res.json({
        isSuccess: true,
        code: 1000,
        message: "이메일 전송 성공",
      });
    }

    else {
      return res.json({
        isSuccess: true,
        code: 2032,
        message: "해당 이메일로 가입된 회원정보가 없습니다.",
      });
    }

  } catch (err) {
    logger.error(`sendEmail - SignUp Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 500,
      message: "비밀번호 찾기 - 이메일 전송 실패",
    });
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
