// src/modules/contact/contact.interface.ts

import { Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}
