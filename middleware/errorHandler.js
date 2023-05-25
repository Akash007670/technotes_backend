const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );

  const status = res.statusCode ? res.statusCode : 500; // 500 is server error.
  res.status(status).json({ message: err.message });
};

module.exports = errorHandler;