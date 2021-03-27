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

      const tempRandomPW = Math.random().toString(36).slice(2);
      const txt = "귀하의 임시 비밀번호는 \n" + tempRandomPW + " 입니다. \n로그인 후 비밀번호를 재설정해주세요.";
      console.log(txt);

      // nodemailer 모듈 요청
      var nodemailer = require('nodemailer');

      // 메일발송 객체
      var mailSender = {
        // 메일발송 함수
        sendGmail : function(param){
          var transporter = nodemailer.createTransport({
            service: 'gmail'
            ,prot : 587
            ,host :'smtp.gmlail.com'
            ,secure : false
            ,requireTLS : true
            , auth: {
              user: 'Wants0Server@gmail.com'
              ,pass: 'WantsServer#2'
            }
          });
          // 메일 옵션
          var mailOptions = {
            from: 'Wants0Server@gmail.com',
            to: email.email, // 수신할 이메일
            subject: '🍰 Wants Team 🍰', // 메일 제목
            text: txt // 메일 내용
          };
          // 메일 발송
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        }
      }
      // 메일객체 exports
      module.exports = mailSender;

      let emailParam = {
        toEmail : email.email
        ,subject  : 'Wants Team'
        ,text : txt
      };

      mailSender.sendGmail(emailParam);

      //임시 비번 계정DB에 넣어두기.
      const hashedPassword = await crypto
          .createHash("sha512")
          .update(tempRandomPW)
          .digest("hex");

      const updateUserInfoParams = [hashedPassword, email.email];
      await passwordDao.updateUserInfo(updateUserInfoParams);

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
