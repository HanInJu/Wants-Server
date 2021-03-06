const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
var cors = require("cors");
module.exports = function () {
  const app = express();

  app.use(compression());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(methodOverride());

  app.use(cors());
  // app.use(express.static(process.cwd() + '/public'));

  /* App (Android, iOS) */
  require("../src/app/routes/userRoute")(app);
  require("../src/app/routes/challengeRoute")(app);
  require("../src/app/routes/bookRoute")(app);
  require("../src/app/routes/reviewRoute")(app);
  require("../src/app/routes/journalsRoute")(app);
  require("../src/app/routes/likeReviewRoute")(app);
  require("../src/app/routes/myPageRoute")(app);
  require("../src/app/routes/passwordRoute")(app);

  /* Web */
  // require('../src/web/routes/indexRoute')(app);

  /* Web Admin*/
  // require('../src/web-admin/routes/indexRoute')(app);
  return app;
};
