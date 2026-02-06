// src/modules/contact/contact.controller.ts

import { Request, Response, NextFunction } from "express";
import * as contactService from "./contact.service";

// Public endpoint - Create contact message
export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.createContactMessage(req.body);

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Get all messages
export const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await contactService.getAllContactMessages();

    res.status(200).json({
      success: true,
      message: "Contact messages retrieved successfully",
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Get single message
export const getMessageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.getContactMessageById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message retrieved successfully",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Mark as read
export const markMessageAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.markAsRead(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Delete message
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.deleteContactMessage(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Get unread count
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await contactService.getUnreadCount();

    res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully",
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};
