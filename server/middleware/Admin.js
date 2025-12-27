import UserModel from "../models/user.model.js";

export const adminOnly = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
        error: true,
        success: false,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authorization failed",
      error: true,
      success: false,
    });
  }
};
