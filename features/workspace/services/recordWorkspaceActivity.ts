import { connectDB } from "@/lib/db";
import WorkspaceActivity, {
  type WorkspaceActivityType,
} from "@/models/WorkspaceActivity";

interface RecordWorkspaceActivityInput {
  workspaceId: string;
  actorId: string;
  type: WorkspaceActivityType;
  targetUserId?: string;
  taskId?: string;
  taskTitle?: string;
  workspaceName?: string;
  fromStatus?: string;
  toStatus?: string;
}

export async function recordWorkspaceActivity(
  activity: RecordWorkspaceActivityInput
) {
  await connectDB();
  await WorkspaceActivity.create(activity);
}
