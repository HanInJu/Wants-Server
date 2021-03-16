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

<<<<<<< HEAD
  /* App (Android, iOS) */
  require("../src/app/routes/indexRoute")(app);
  require("../src/app/routes/userRoute")(app);
  require("../src/app/routes/challengeRoute")(app);
  require("../src/app/routes/bookRoute")(app);
=======
    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);
    require('../src/app/routes/reviewRoute')(app);
    require("../src/app/routes/challengeRoute")(app);


>>>>>>> 4b9508023675447e84468f4daad9cc9916e61baa
  /* Web */
  // require('../src/web/routes/indexRoute')(app);

  /* Web Admin*/
  // require('../src/web-admin/routes/indexRoute')(app);
  return app;
};
