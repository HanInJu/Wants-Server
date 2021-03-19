module.exports = function (app) {
  const likeReview = require("../controllers/likeReviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.route('/like/review/:reviewId').post(jwtMiddleware, likeReview.like);
  app.route('/comments/review/:reviewId').post(jwtMiddleware, likeReview.comment);
  app.route('/comments/review/:commentId').delete(jwtMiddleware, likeReview.deleteComment);
  app.route('/report-review-comment/:commentId').post(jwtMiddleware, likeReview.reportComment);

};
