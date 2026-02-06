// src/modules/contact/contact.service.ts

import { Contact } from "./contact.model";
import { IContactInput } from "./contact.interface";

// Create a new contact message (public)
export const createContactMessage = async (data: IContactInput) => {
  const contact = await Contact.create(data);
  return contact;
};

// Get all contact messages (admin only)
export const getAllContactMessages = async () => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  return contacts;
};

// Get single contact message (admin only)
export const getContactMessageById = async (id: string) => {
  const contact = await Contact.findById(id);
  return contact;
};

// Mark message as read (admin only)
export const markAsRead = async (id: string) => {
  const contact = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
  return contact;
};

// Delete contact message (admin only)
export const deleteContactMessage = async (id: string) => {
  const contact = await Contact.findByIdAndDelete(id);
  return contact;
};

// Get unread messages count (admin only)
export const getUnreadCount = async () => {
  const count = await Contact.countDocuments({ isRead: false });
  return count;
};
