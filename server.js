const express = require("express");
const path = require("path");
const cors = require("cors");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 3500;
const app = express();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));

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

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));
