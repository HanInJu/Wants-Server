module.exports = function (app) {
  const challenge = require("../controllers/challengeController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.post("/challenge", jwtMiddleware, challenge.postchallenge); // 챌린지 추가
  app.post("/challenge/book", jwtMiddleware, challenge.postchallengeBook); // 챌린지 책 추가
  app.get("/challenge", jwtMiddleware, challenge.getchallenge); // 챌린지 조회

  app.patch("/challenge/book", jwtMiddleware, challenge.patchchallengeBook); // 챌린지 책 변경
  app.delete("/challenge/book", jwtMiddleware, challenge.deletechallengeBook); // 챌린지 책 삭제
  app.patch("/challenge", jwtMiddleware, challenge.patchchallenge); // 목표 변경

  app.get("/challenge/:goalBookId/times", jwtMiddleware, challenge.getbookTime); // 오늘 읽은 책의 총 시간
};
