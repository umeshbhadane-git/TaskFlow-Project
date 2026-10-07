import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task is required"],
      index: true,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    body: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [
        2000,
        "Comment cannot exceed 2000 characters",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently fetch comments for a task in chronological order.
commentSchema.index({
  taskId: 1,
  createdAt: 1,
});

const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", commentSchema);

export default Comment;