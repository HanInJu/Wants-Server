module.exports = function (app) {
  const review = require("../controllers/reviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.get("/review/", jwtMiddleware, review.getReview);
  app.route("/review").post(jwtMiddleware, review.postReview);
  app
    .route("/review/:reviewId/isPublic")
    .post(jwtMiddleware, review.changePublic);
  //app.patch('/review', jwtMiddleware, review.reviseReview);
  //app.route('/review').delete(jwtMiddleware, review.deleteReview);

  //app.route('/report-review').post(jwtMiddleware, review.reportReview);

  //app.get("/journals", jwtMiddleware, challenge.getjournals); // 일지 조회
  app.post("/journals", jwtMiddleware, review.postjournals); // 일지 추가
  //app.patch("/journals", jwtMiddleware, challenge.patchjournals); // 일지 수정
  //app.get("/journals/:journalsId", jwtMiddleware, challenge.getpatchjournals); // 일지 수정위한 조회
  //app.delete("/journals", jwtMiddleware, challenge.deletejournals); // 일지 삭제
};
