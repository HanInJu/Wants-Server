module.exports = function(app){
    const pw = require('../controllers/passwordController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // app.route('/signUp').post(user.signUp);
    // app.route('/signIn').post(user.signIn);
    //
    app.patch('/email', pw.sendEmail);
};