import { describe, expect, it } from "vitest";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { createTaskSchema } from "@/features/task/schemas/task.schema";
import { createCommentSchema } from "@/features/comment/schemas/comment.schema";

describe("login validation", () => {
  it("normalizes valid email addresses", () => {
    expect(
      loginSchema.parse({
        email: "  USER@Example.COM ",
        password: "correct horse",
      })
    ).toEqual({
      email: "user@example.com",
      password: "correct horse",
    });
  });

  it("rejects malformed email addresses", () => {
    expect(
      loginSchema.safeParse({
        email: "not-an-email",
        password: "password",
      }).success
    ).toBe(false);
  });

  it("requires a password", () => {
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      }).success
    ).toBe(false);
  });
});

describe("task validation", () => {
  it("trims task title and description", () => {
    const result = createTaskSchema.parse({
      title: "  Prepare release  ",
      description: "  Verify production build  ",
      priority: "HIGH",
      dueDate: "2026-11-15",
      assigneeId: "507f1f77bcf86cd799439011",
      tags: "release",
    });

    expect(result.title).toBe("Prepare release");
    expect(result.description).toBe("Verify production build");
  });

  it("rejects task titles shorter than two characters", () => {
    expect(
      createTaskSchema.safeParse({
        title: "x",
        description: "",
        priority: "LOW",
        dueDate: "2026-11-15",
        assigneeId: "507f1f77bcf86cd799439011",
        tags: "",
      }).success
    ).toBe(false);
  });

  it("rejects priorities outside the supported values", () => {
    expect(
      createTaskSchema.safeParse({
        title: "Prepare release",
        description: "",
        priority: "URGENT",
        dueDate: "2026-11-15",
        assigneeId: "507f1f77bcf86cd799439011",
        tags: "",
      }).success
    ).toBe(false);
  });
});

describe("comment validation", () => {
  it("trims and rejects empty comment bodies", () => {
    expect(
      createCommentSchema.safeParse({
        taskId: "507f1f77bcf86cd799439011",
        body: "   ",
      }).success
    ).toBe(false);
  });
});
