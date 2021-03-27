module.exports = function (app) {
  const review = require("../controllers/reviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

    app.get('/my-review', jwtMiddleware, review.getReview);
    app.route('/review').post(jwtMiddleware, review.postReview);
    app.route('/review/:reviewId').patch(jwtMiddleware, review.reviseReview);
    app.route('/review/:reviewId').delete(jwtMiddleware, review.deleteReview);
    app.route('/report-review/:reviewId').post(jwtMiddleware, review.reportReview);

    app.get('/review/:reviewId/comments', jwtMiddleware, review.getComments);
    app.get('/my-review/:reviewId', jwtMiddleware, review.getMyReview);
};
