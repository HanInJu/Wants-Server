module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signUp').post(user.signUp);
    app.route('/signIn').post(user.signIn);

    app.get('/check', jwtMiddleware, user.check);
    app.delete('/bye', jwtMiddleware, user.bye);
    //password 찾는 건 password 관련 파일에 있습니다.
};