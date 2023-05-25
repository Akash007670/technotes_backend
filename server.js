const express = require("express");
const path = require("path");
const cors = require("cors");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConnection");
const mongoose = require("mongoose");
require("dotenv").config();
const PORT = process.env.PORT || 3500;
const app = express();

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));

//Trying to access page or route if not available will give page 404.
app.all("*", (req, res) => {
  res.status(400);

  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//Custom Middleware for errorHandling
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
