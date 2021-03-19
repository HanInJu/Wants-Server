module.exports = function (app) {
  const review = require("../controllers/reviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

    app.get('/review/', jwtMiddleware, review.getReview);
    app.route('/review').post(jwtMiddleware, review.postReview);
    app.route('/review/:reviewId').patch(jwtMiddleware, review.reviseReview);

    app.route('/review/:reviewId').delete(jwtMiddleware, review.deleteReview);
    //app.route('/report-review').post(jwtMiddleware, review.reportReview);

};
