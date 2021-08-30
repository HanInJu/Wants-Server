module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signUp').post(user.signUp); //이름 없는 회원가입
    app.route('/signIn').post(user.signIn); //로그인

    app.get('/check', jwtMiddleware, user.check); //토큰 검증
    app.delete('/bye', jwtMiddleware, user.bye); //탈퇴

    app.get('/my-name', jwtMiddleware, user.isReader); //이름 등록했는지 조회
    app.route('/join').post(user.join); //이름 있는 회원가입

    app.get('/user/name', user.isDuplicated);

    //password 관련 파일은 따로 passwordRoutes.js, passwordController.js, passwordDao.js에 있습니다.
};