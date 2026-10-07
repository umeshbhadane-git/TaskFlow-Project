import mongoose, { Document, Model, Schema } from "mongoose";

export type JoinRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface IJoinRequest extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: JoinRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      required: [true, "Join request status is required"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

// A user can have only one pending request
// for the same workspace.
joinRequestSchema.index(
  { workspaceId: 1, userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "PENDING",
    },
  }
);

const JoinRequest: Model<IJoinRequest> =
  mongoose.models.JoinRequest ||
  mongoose.model<IJoinRequest>(
    "JoinRequest",
    joinRequestSchema
  );

export default JoinRequest;