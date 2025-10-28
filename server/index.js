import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import colors from "colors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import timerRoutes from "./routes/timerRoute.js";

//Dotenv Config
dotenv.config();

// DB Config
connectDB();

// Express Config
const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  credentials: true,
};

// Middleware Config
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Routes Config
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/time-tracker", timerRoutes);

// Rest API Config
app.use("/", (req, res) => {
  res.send(`<h1>Server is running on post ${process.env.PORT}</h1>`);
});

// PORT
const port = process.env.PORT || 8098;

app.listen(port, () => {
  console.log(
    `Server is running on port ${colors.green(port)} in ${colors.blue(
      "development"
    )} mode`.bgMagenta.white
  );
});
