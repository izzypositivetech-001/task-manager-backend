import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";

// Cookie settings
const REFRESH_COOKIE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: REFRESH_COOKIE_AGE,
  path: "/",
});

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine role
    let role = "member";
    if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      role = "admin";
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    // Generate tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Set refresh token as an httpOnly cookie
    res.cookie("jid", refreshToken, getCookieOptions());

    // Do not return refresh token in response body for security
    res.status(201).json({
      message: "Registration successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Set refresh token cookie
    res.cookie("jid", refreshToken, getCookieOptions());

    // Only return accessToken and user details
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Refresh Token
// @route POST /api/auth/refresh
// @access Public
const refreshToken = async (req, res) => {
  const token = req.cookies.jid || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    // Rotate refresh cookie
    res.cookie("jid", newRefreshToken, getCookieOptions());

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// @desc Log out user
// @route POST /api/auth/logout
// @access Private
const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Invalidate refresh tokens by incrementing tokenVersion
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

    // Clear cookie using same options (path is important)
    res.clearCookie("jid", { path: "/" });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { registerUser, loginUser, refreshToken, getUserProfile, updateUserProfile, logoutUser };
