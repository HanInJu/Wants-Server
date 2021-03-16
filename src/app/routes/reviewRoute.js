module.exports = function(app){
    const review = require('../controllers/reviewController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // app.route('/app/signUp').post(user.signUp);
    // app.route('/app/signIn').post(user.signIn);
    //
    // app.get('/check', jwtMiddleware, user.check);

    app.route('/review').post(jwtMiddleware, review.postReview);
};