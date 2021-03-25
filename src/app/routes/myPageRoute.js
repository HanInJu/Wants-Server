module.exports = function (app) {
  const myPage = require("../controllers/myPageController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.route('/profile').post(jwtMiddleware, myPage.profile);
  app.get('/name', jwtMiddleware, myPage.isDuplicatedName);
  app.get('/profile', jwtMiddleware, myPage.getProfile);
  app.get('/rewards', jwtMiddleware, myPage.getPieces);
  app.get('/reading-info', jwtMiddleware, myPage.getReadingInfo);
  app.get('/reading-graph', jwtMiddleware, myPage.getReadingGraph);

};
