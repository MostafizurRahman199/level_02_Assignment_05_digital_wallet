import { Schema, model } from "mongoose";
import { IUser, UserRole } from "./auth.interface";

const userSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true 
    },
    phone: { 
      type: String, 
      required: [true, "Phone is required"], 
      unique: true, 
      trim: true,
      match: [/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"]
    },
    password: { 
      type: String, 
      required: [true, "Password is required"], 
      minlength: [6, "Password must be at least 6 characters"] 
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Role must be either admin, user, or agent"
      },
      default: UserRole.USER,
    },
    wallet: { 
      type: Schema.Types.ObjectId, 
      ref: "Wallet" 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isApproved: {
      type: Boolean,
      default: true // Default true, will be set conditionally in pre-save
    },
    commissionRate: {
      type: Number,
      default: 1.5,
      min: [0, "Commission rate cannot be negative"],
      max: [10, "Commission rate cannot exceed 10%"]
    },
  },
  { 
    timestamps: true 
  }
);

// Pre-save middleware to set isApproved based on role
userSchema.pre<IUser>("save", function(next) {
  // If user is an agent and isApproved is still default (true), set to false
  if (this.role === UserRole.AGENT && this.isApproved === true) {
    this.isApproved = false;
  }
  // For non-agents, ensure isApproved is true
  if (this.role !== UserRole.AGENT) {
    this.isApproved = true;
  }
  next();
});

// Index for better performance
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1 });

export const User = model<IUser>("User", userSchema);