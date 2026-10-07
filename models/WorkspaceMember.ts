import mongoose, { Document, Model, Schema } from "mongoose";

export type WorkspaceMemberRole = "OWNER" | "MEMBER";

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: WorkspaceMemberRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
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

    role: {
      type: String,
      enum: ["OWNER", "MEMBER"],
      required: [true, "Workspace member role is required"],
      default: "MEMBER",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A user can belong to a workspace only once.
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

const WorkspaceMember: Model<IWorkspaceMember> =
  mongoose.models.WorkspaceMember ||
  mongoose.model<IWorkspaceMember>(
    "WorkspaceMember",
    workspaceMemberSchema
  );

export default WorkspaceMember;