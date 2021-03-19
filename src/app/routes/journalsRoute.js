module.exports = function (app) {
  const journals = require("../controllers/journalsController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //app.get("/journals", jwtMiddleware, challenge.getjournals); // 일지 조회
  app.post("/journals", jwtMiddleware, journals.postjournals); // 일지 추가
  app.patch("/journals", jwtMiddleware, journals.patchjournals); // 일지 수정
  app.get("/journals/:journalId", jwtMiddleware, journals.getpatchjournals); // 일지 수정위한 조회
  app.delete("/journals", jwtMiddleware, journals.deletejournals); // 일지 삭제
};
