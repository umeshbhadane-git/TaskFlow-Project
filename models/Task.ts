import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ITask extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assigneeId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required"],
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Task title must be at least 2 characters"],
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      required: [true, "Task status is required"],
      default: "TODO",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: [true, "Task priority is required"],
      default: "MEDIUM",
    },

    // REQUIRED
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // REQUIRED
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task assignee is required"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);

export default Task;