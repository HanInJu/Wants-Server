module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signUp').post(user.signUp);
    app.route('/signIn').post(user.signIn);

    app.get('/check', jwtMiddleware, user.check);
    app.delete('/bye', jwtMiddleware, user.bye);

    //password 관련 파일은 따로 passwordRoutes.js 등에 있습니다.
};