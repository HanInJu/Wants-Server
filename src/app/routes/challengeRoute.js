module.exports = function (app) {
  const challenge = require("../controllers/challengeController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.post("/challenge", jwtMiddleware, challenge.postchallenge); // 챌린지 추가
  app.post("/challenge/book", jwtMiddleware, challenge.postchallengeBook); // 챌린지 책 추가
  app.get("/challenge", jwtMiddleware, challenge.getchallenge); // 챌린지 조회
  app.get("/challenge/:goalId", jwtMiddleware, challenge.getgoal); // 챌린지 현황

  app.delete(
    "/challenge/book/:goalbookId",
    jwtMiddleware,
    challenge.deletechallengeBook
  ); // 챌린지 책 삭제
  app.patch("/challenge", jwtMiddleware, challenge.patchchallenge); // 목표 변경
  app.patch("/challenge/time", jwtMiddleware, challenge.patchchallengeTime); // 시간만 변경

  app.get("/challenge/:goalBookId/times", jwtMiddleware, challenge.getbookTime); // 오늘 읽은 책의 총 시간

  app.route("/cake").post(jwtMiddleware, challenge.postCake); //챌린지 목표 달성 시 부여될 케이크 종류

  app.get("/challenge/goal/book", jwtMiddleware, challenge.getgoalBook); // 책관리조회
  app.patch(
    "/challenge/goal/book/:goalbookId",
    jwtMiddleware,
    challenge.patchgoalBook
  ); // 도전중인 책 변경
  app.patch("/challenge/expiration", jwtMiddleware, challenge.patchexpiration); // 만료된 챌린지 재시작
};
