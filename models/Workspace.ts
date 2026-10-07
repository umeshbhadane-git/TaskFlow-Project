import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
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
      maxlength: [500, "Workspace description cannot exceed 500 characters"],
      default: "",
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Workspace owner is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace ||
  mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;