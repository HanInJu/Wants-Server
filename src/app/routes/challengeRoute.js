module.exports = function (app) {
  const challenge = require("../controllers/challengeController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.post("/challenge", challenge.postchallenge); // 챌린지 추가
  app.post("/challenge/book", challenge.postchallengeBook); // 챌린지 책 추가
  app.get("/challenge", challenge.getchallenge); // 챌린지 조회

  app.patch("/challenge/book", challenge.patchchallengeBook); // 챌린지 책 변경
  app.delete("/challenge/book", jwtMiddleware, challenge.deletechallengeBook); // 챌린지 책 삭제
  app.patch("/challenge", challenge.patchchallenge); // 챌린지 변경
};
