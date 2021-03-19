module.exports = function (app) {
  const likeReview = require("../controllers/likeReviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.route('/like/review/:reviewId').post(jwtMiddleware, likeReview.like);

};
