import mongoose, { Document, Model, Schema } from "mongoose";

export type WorkspaceStatus = "ACTIVE" | "INACTIVE";

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  status: WorkspaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      minlength: [2, "Workspace name must be at least 2 characters"],
      maxlength: [100, "Workspace name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Workspace description cannot exceed 500 characters",
      ],
      default: "",
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Workspace owner is required"],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: [true, "Workspace status is required"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ status: 1 });

const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace ||
  mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;