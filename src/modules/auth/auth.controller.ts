import { Request, Response } from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword as changePasswordService } from "./auth.service";



export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        token: result.token // ✅ ADD THIS LINE
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const result = await loginUser(phone, password);

    // 🟩 Set JWT in httpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        token: result.token // ✅ ADD THIS LINE - return token in response too
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const user = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};



export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const user = await updateUserProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};



export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const { currentPassword, newPassword } = req.body;

    await changePasswordService(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};




export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};