import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    if (password.length < 5) {
      return res.status(400).json({
        message: "Password must be at least 5 characters long",
        success: false,
      });
    }
    const exisitngUser = await User.findOne({ email });
    if (exisitngUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      await user.save();
      generateToken(user._id, res);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        message: "User created successfully",
        success: true,
      });
    } else {
      res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("error in signup", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      message: "User login successfully",
      success: true,
    });
  } catch (error) {
    console.log("error in login", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res
      .status(200)
      .json({ message: "User logout successfully", success: true });
  } catch (error) {
    console.log("error in logout", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Profile picture is required", success: false });
    }

    const result = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      updatedUser,
      message: "Profile picture updated successfully",
      success: true,
    });
  } catch (error) {
    console.log("error in update profile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { user } = req.user;
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in isAuth", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
