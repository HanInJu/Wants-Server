const express = require("./config/express");
const { logger } = require("./config/winston");

// const port = 4000; //dev 서버용
const port = 5000; //prod 서버용
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
