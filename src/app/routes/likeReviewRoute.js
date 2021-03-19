module.exports = function (app) {
  const likeReview = require("../controllers/likeReviewontroller");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.route('/like/:reviewId').post(jwtMiddleware, likeReview.profile);

};
