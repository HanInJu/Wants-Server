module.exports = function(app){
    const pw = require('../controllers/passwordController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //app.post('/email', pw.sendEmail);
    app.route('/email').post(pw.sendEmail);
    app.patch('/reset', jwtMiddleware, pw.resetPW);
};