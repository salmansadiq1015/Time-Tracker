import jwt from "jsonwebtoken";
import authModel from "../models/authModel.js";

// Is Authenticated

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized",
      error: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).send({
        success: false,
        message: "JWT Token is invalid or expired!",
      });
    }

    const user = await authModel
      .findById(decoded.user._id)
      .select("name email roles");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "JWT Token is invalid or expired!",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Is Admin
export const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access! User not authenticated.",
    });
  }
  try {
    const user = await authModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access! User not found.",
      });
    }

    if (!user.roles.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Forbidden! User does not have admin privileges.!",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
