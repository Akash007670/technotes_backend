const whiteList = ["http://localhost:3500/", "https://www.google.com/"];

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true); //null is usually the error and true is supposed to allowed to pass to cors from the given whitelist
    } else {
      callback(new Error("Not Allowed By CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
