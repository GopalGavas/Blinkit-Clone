import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import {
  uploadImageCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadImageCloudinary.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicId.js";
import generatedOtp from "../utils/generatedOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Provide name, email, password",
        error: true,
        success: false,
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
    });

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${newUser._id}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify your email",
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl,
      }),
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "User registered successfully",
      error: false,
      success: true,
      data: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Verification code is missing",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(code);

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification link",
        error: true,
        success: false,
      });
    }

    if (user.verify_email) {
      return res.status(200).json({
        message: "Email already verified",
        error: false,
        success: true,
      });
    }

    user.verify_email = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

//login controller
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (!user.verify_email) {
      return res.status(403).json({
        message: "Please verify your email first",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        message: "Contact admin",
        error: true,
        success: false,
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: refreshToken,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      success: true,
      error: false,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

//logout controller
export async function logoutController(req, res) {
  try {
    const userId = req.userId; // from auth middleware

    const cookieOptions = {
      httpOnly: true,
      secure: true, // true in production (HTTPS)
      sameSite: "none",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return res.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

//upload user avatar
export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId; // auth middleware
    const image = req.file; // multer middleware

    if (!image) {
      return res.status(400).json({
        message: "Please upload an image",
        error: true,
        success: false,
      });
    }

    const upload = await uploadImageCloudinary(image);

    if (!upload?.url) {
      return res.status(500).json({
        message: "Image upload failed",
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });

    return res.json({
      message: "Profile image updated",
      success: true,
      error: false,
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

// remove avatar
export async function removeAvatar(req, res) {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user.avatar) {
      return res.json({ success: true, message: "No avatar to remove" });
    }

    // Delete from Cloudinary
    const publicId = extractPublicIdFromUrl(user.avatar);
    await deleteFromCloudinary(publicId);

    user.avatar = "";
    await user.save();

    return res.json({ success: true, message: "Avatar removed", data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

//update user details
export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId;
    const { name, mobile, password, removeAvatar } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    // ---------------- HANDLE AVATAR ----------------
    if (removeAvatar && user.avatar) {
      // Delete old avatar from Cloudinary
      const oldPublicId = extractPublicIdFromUrl(user.avatar);
      await deleteFromCloudinary(oldPublicId);

      updateData.avatar = "";
    }

    if (req.file) {
      // Delete old avatar if exists
      if (user.avatar) {
        const oldPublicId = extractPublicIdFromUrl(user.avatar);
        await deleteFromCloudinary(oldPublicId);
      }

      // Upload new avatar
      const uploadResult = await uploadImageCloudinary(req.file);
      updateData.avatar = uploadResult.secure_url;
    }

    const updatedUserData = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
      }
    );

    return res.json({
      message: "Profile updated successfully",
      error: false,
      success: true,
      data: updatedUserData,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

// forgot password
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const otp = generatedOtp();
    const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: expireTime,
      forgot_password_verified: false, // reset flag
    });

    await sendEmail({
      sendTo: email,
      subject: "Forgot password from Binkeyit",
      html: forgotPasswordTemplate({
        name: user.name,
        otp,
      }),
    });

    return res.json({
      message: "Check your email",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide email and otp",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (user.forgot_password_expiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: "",
      forgot_password_verified: true, // 🔥 THIS WAS MISSING
    });

    return res.json({
      message: "OTP verified successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//reset the password
export async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide email, newPassword, confirmPassword",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not found",
        error: true,
        success: false,
      });
    }

    if (!user.forgot_password_verified) {
      return res.status(403).json({
        message: "OTP verification required",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashPassword,
      forgot_password_verified: false,
    });

    return res.json({
      message: "Password updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

//refresh token controler
export async function refreshTokenController(req, res) {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.headers?.authorization?.split(" ")[1]; // [Bearer token]

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
        error: true,
        success: false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        error: true,
        success: false,
      });
    }

    const userId = decoded.id;

    const user = await UserModel.findById(userId);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        message: "Refresh token invalid or already used",
        error: true,
        success: false,
      });
    }

    const newAccessToken = await generatedAccessToken(userId);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: "Lax", // or "None" for cross-site requests with https
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);

    return res.status(200).json({
      message: "New access token generated successfully",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

//get login user details
export async function userDetails(req, res) {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId).select(
      "-password -refresh_token -forgot_password_otp -forgot_password_expiry"
    );

    return res.json({
      message: "User details fetched",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}
