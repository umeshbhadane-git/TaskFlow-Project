import mongoose, { Document, Model, Schema } from "mongoose";

export type NotificationType =
  | "TASK_COMPLETED"
  | "TASK_ASSIGNED"
  | "JOIN_REQUEST"
  | "JOIN_REQUEST_APPROVED"
  | "JOIN_REQUEST_REJECTED";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
      index: true,
    },

    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },

    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "TASK_COMPLETED",
        "TASK_ASSIGNED",
        "JOIN_REQUEST",
        "JOIN_REQUEST_APPROVED",
        "JOIN_REQUEST_REJECTED",
      ],
      required: [true, "Notification type is required"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [
        500,
        "Notification message cannot exceed 500 characters",
      ],
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently fetch a user's notifications.
notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

// Efficiently fetch unread notifications.
notificationSchema.index({
  recipientId: 1,
  read: 1,
  createdAt: -1,
});

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );

export default Notification;