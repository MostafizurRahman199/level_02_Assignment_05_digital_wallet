// src/modules/auth/auth.interface.ts

import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

/**
 * Enum for User Roles
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  AGENT = "agent",
}

/**
 * Interface representing a User Document
 */
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  wallet?: Types.ObjectId;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface for JWT Payload
 */
export interface JWTPayload extends JwtPayload {
  sub: string; // user id
  role: UserRole;
}
