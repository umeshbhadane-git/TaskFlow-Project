import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  connectDB: vi.fn(),
  userFindOne: vi.fn(),
  userFindById: vi.fn(),
  bcryptCompare: vi.fn(),
  workspaceFindById: vi.fn(),
  workspaceMemberFindOne: vi.fn(),
  taskCreate: vi.fn(),
  taskFindById: vi.fn(),
  commentCreate: vi.fn(),
  notificationCreate: vi.fn(),
  recordActivity: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ connectDB: mocks.connectDB }));
vi.mock("@/models/User", () => ({
  default: {
    findOne: mocks.userFindOne,
    findById: mocks.userFindById,
  },
}));
vi.mock("@/models/Workspace", () => ({
  default: { findById: mocks.workspaceFindById },
}));
vi.mock("@/models/WorkspaceMember", () => ({
  default: { findOne: mocks.workspaceMemberFindOne },
}));
vi.mock("@/models/Task", () => ({
  default: {
    create: mocks.taskCreate,
    findById: mocks.taskFindById,
  },
}));
vi.mock("@/models/Comment", () => ({
  default: { create: mocks.commentCreate },
}));
vi.mock("@/models/Notification", () => ({
  default: { create: mocks.notificationCreate },
}));
vi.mock("@/features/workspace/services/recordWorkspaceActivity", () => ({
  recordWorkspaceActivity: mocks.recordActivity,
}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("bcryptjs", () => ({
  default: { compare: mocks.bcryptCompare },
}));

import { authorizeCredentials } from "@/lib/authorizeCredentials";
import { createTask } from "@/features/task/actions/createTask";
import { createComment } from "@/features/comment/actions/createComment";

const ownerId = "507f1f77bcf86cd799439011";
const memberId = "507f1f77bcf86cd799439012";
const workspaceId = "507f1f77bcf86cd799439013";
const taskId = "507f1f77bcf86cd799439014";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connectDB.mockResolvedValue(undefined);
  mocks.recordActivity.mockResolvedValue(undefined);
  mocks.notificationCreate.mockResolvedValue(undefined);
});

describe("critical application flows", () => {
  it("authenticates a user with valid credentials", async () => {
    const user = {
      _id: { toString: () => ownerId },
      name: "Umesh",
      email: "umesh@example.com",
      password: "hashed-password",
      avatar: "",
    };
    mocks.userFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });
    mocks.bcryptCompare.mockResolvedValue(true);

    const result = await authorizeCredentials({
      email: " UMESH@EXAMPLE.COM ",
      password: "safe-password",
    });

    expect(mocks.connectDB).toHaveBeenCalledOnce();
    expect(mocks.userFindOne).toHaveBeenCalledWith({
      email: "umesh@example.com",
    });
    expect(mocks.bcryptCompare).toHaveBeenCalledWith(
      "safe-password",
      "hashed-password"
    );
    expect(result).toEqual({
      id: ownerId,
      name: "Umesh",
      email: "umesh@example.com",
      image: null,
    });
  });

  it("creates a task for a workspace owner and records assignment", async () => {
    mocks.auth.mockResolvedValue({ user: { id: ownerId } });
    mocks.workspaceFindById.mockResolvedValue({
      status: "ACTIVE",
      ownerId,
    });
    mocks.workspaceMemberFindOne.mockResolvedValue({ role: "MEMBER" });
    mocks.taskCreate.mockResolvedValue({
      _id: { toString: () => taskId },
      title: "Review pull request",
    });
    mocks.userFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ name: "Member" }),
    });

    const result = await createTask(
      { success: false, error: { code: "", message: "" } },
      makeFormData({
        workspaceId,
        title: "Review pull request",
        description: "Check the release changes",
        priority: "HIGH",
        dueDate: "2026-12-01",
        assigneeId: memberId,
        tags: "release, review",
      })
    );

    expect(result).toMatchObject({
      success: true,
      taskId,
    });
    expect(mocks.taskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        title: "Review pull request",
        status: "TODO",
        assigneeId: memberId,
        createdBy: ownerId,
        tags: ["release", "review"],
      })
    );
    expect(mocks.recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TASK_CREATED", taskId })
    );
    expect(mocks.notificationCreate).toHaveBeenCalledOnce();
  });

  it("creates a comment for a workspace member and records activity", async () => {
    mocks.auth.mockResolvedValue({ user: { id: memberId } });
    mocks.taskFindById.mockResolvedValue({
      _id: { toString: () => taskId },
      workspaceId: { toString: () => workspaceId },
      title: "Review pull request",
    });
    mocks.workspaceMemberFindOne.mockResolvedValue({ role: "MEMBER" });
    mocks.commentCreate.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439015" },
    });

    const result = await createComment(
      { success: false, error: { code: "", message: "" } },
      makeFormData({
        taskId,
        body: "  Looks good to me.  ",
      })
    );

    expect(result).toMatchObject({
      success: true,
      message: "Comment added successfully.",
    });
    expect(mocks.commentCreate).toHaveBeenCalledWith({
      taskId: expect.anything(),
      authorId: memberId,
      body: "Looks good to me.",
    });
    expect(mocks.recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        actorId: memberId,
        type: "COMMENT_ADDED",
        taskTitle: "Review pull request",
      })
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/workspaces/${workspaceId}/tasks/${taskId}`
    );
  });
});
