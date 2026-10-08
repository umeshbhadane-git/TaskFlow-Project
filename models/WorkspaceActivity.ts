import mongoose, { Document, Model, Schema } from "mongoose";

export type WorkspaceActivityType =
  | "WORKSPACE_CREATED"
  | "MEMBER_JOINED"
  | "TASK_CREATED"
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "COMMENT_ADDED";

export interface IWorkspaceActivity extends Document {
  workspaceId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId | null;
  taskId?: mongoose.Types.ObjectId | null;
  taskTitle?: string;
  workspaceName?: string;
  type: WorkspaceActivityType;
  fromStatus?: string;
  toStatus?: string;
  createdAt: Date;
}

const workspaceActivitySchema = new Schema<IWorkspaceActivity>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    taskTitle: {
      type: String,
      trim: true,
    },
    workspaceName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "WORKSPACE_CREATED",
        "MEMBER_JOINED",
        "TASK_CREATED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "COMMENT_ADDED",
      ],
      required: true,
    },
    fromStatus: String,
    toStatus: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

workspaceActivitySchema.index({ workspaceId: 1, createdAt: -1 });

const WorkspaceActivity: Model<IWorkspaceActivity> =
  mongoose.models.WorkspaceActivity ||
  mongoose.model<IWorkspaceActivity>(
    "WorkspaceActivity",
    workspaceActivitySchema
  );

export default WorkspaceActivity;
