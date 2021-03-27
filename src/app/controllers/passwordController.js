const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const nodemailer = require("nodemailer");
// const smtpServerURL = "email SMTP 서버 주소";
const authUser = "Wants0Server@gmail.com"; //email 계정
const authPass = "WantsServer#2"; //email 계정 PW
const fromEmail = 'Wants0Server@gmail.com'; //보내는 사람 email 주소

const userDao = require("../dao/userDao");
const passwordDao = require("../dao/passwordDao");
const { constants } = require("buffer");

/*
 * 최종 수정일 : 2021.03.27.SAT
 * API 기 능 : 비밀번호 찾기 - 이메일 전송
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

  if (!regexEmail.test(email.email))
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  try {

    const emailRows = await passwordDao.isExistEmail(email.email); // 해당 이메일로 가입된 정보가 있는지 확인
    if (emailRows[0].exist === 1) { //가입된 정보가 있을 경우

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        //port: 587, //secure: false 일 때만 포트번호 지정 필요
        secure: true, // true for 465, false for other ports
        auth: {
          user: authUser,
          pass: authPass
        }
      });

      const tempRandomPW = Math.random().toString(36).slice(2);
      const txt = "귀하의 임시 비밀번호는 \n" + tempRandomPW + "입니다. \n로그인 후 비밀번호를 재설정해주세요.";

      console.log(tempRandomPW, txt);

      let mailOptions = {
        from: fromEmail,        //보내는 사람 주소
        to: email ,           //받는 사람 주소
        subject: "[Reading Piece] 임시 비밀번호 발급 안내",  //제목
        text: txt               //본문
      };

      //전송 시작!
      transporter.sendMail(mailOptions, function(error, info){
        if (error) { //에러
          console.log(error);
          return res.json({
            isSuccess: false,
            code: 500,
            message: "비밀번호 찾기 - 이메일 전송 실패",
          });
        }
        //전송 완료
        console.log("Finish sending email : " + info.response);
        transporter.close()
      })

      //임시 비번 계정DB에 넣어두기.
      const hashedPassword = await crypto
          .createHash("sha512")
          .update(tempRandomPW)
          .digest("hex");

      const updateUserInfoParams = [hashedPassword, email.email];
      await passwordDao.updateUserInfo(updateUserInfoParams);
      //console.log("여기", updateUserInfoParams);

      return res.json({
        isSuccess: true,
        code: 1000,
        message: "이메일 전송 및 임시 비밀번호 적용 성공",
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

/*
 * 최종 수정일 : 2021.03.27.SAT
 * API 기 능 : 비밀번호 재설정
 */
exports.resetPW = async function (req, res) {

  try {
    const userId = req.verifiedToken.id;
    const password = req.body.password;
    const userRows = await userDao.getuser(userId);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 4020,
        message: "가입되어있지 않은 유저입니다.",
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

    const hashedPassword = await crypto
        .createHash("sha512")
        .update(password)
        .digest("hex");

    const beforePW = await passwordDao.isSamePW(userId);
    if(beforePW[0].password === hashedPassword) {
      return res.json({
        isSuccess: false,
        code: 2033,
        message: "동일한 비밀번호로는 변경할 수 없습니다.",
      });
    }
    else {
      const userInfoParams = [hashedPassword, userId];
      await passwordDao.updateUserPW(userInfoParams);

      return res.json({
        isSuccess: true,
        code: 1000,
        message: "비밀번호 변경 성공",
      });
    }

  } catch (err) {
    logger.error(`updatePW - non transaction DB Connection error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 500,
      message: "비밀번호 변경 실패",
    });
  }
};
