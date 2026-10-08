# TaskFlow: Interview Walkthrough

**Created:** October 8, 2026 at 11:12 (UTC+05:30)

Use this guide to explain TaskFlow in an interview or project demo. It is a
simple script, so you can say it in your own words.

## 1. The problem

> “TaskFlow is a task management app for teams. Teams often need one place to
> organize work, decide who is doing each task, see progress, and discuss task
> details. TaskFlow brings those things together in shared workspaces.”

## 2. How it is built

> “The app uses Next.js and React to build its pages and user interface.
> TypeScript helps catch coding mistakes. Auth.js handles sign-in, and MongoDB
> stores users, workspaces, tasks, and comments. The server checks who is
> signed in and what they are allowed to do before saving changes.”

If asked for more detail:

- **Pages and interface:** Next.js, React, Tailwind CSS
- **Data:** MongoDB and Mongoose
- **Sign-in:** Auth.js and hashed passwords
- **Input checks:** Zod
- **Task board:** dnd-kit for drag and drop
- **Automated tests:** Vitest

## 3. Features to show

Choose two or three features depending on the time available.

### A. Workspace and task board

1. Open a workspace.
2. Show the task board and its status columns.
3. Move a task to another column.

> “The board makes it easy to see what needs to be done, what is in progress,
> and what is finished. A task can be moved as its status changes.”

### B. Task details and comments

1. Open a task.
2. Show its details, assignee, due date, or priority.
3. Add a comment and show that it appears on the page.

> “Task details keep the work and its discussion together. Comments help team
> members share updates without losing the context of the task.”

### C. Workspace membership and permissions

1. Show the workspace member area or settings.
2. Explain that workspace owners manage workspace settings and tasks.
3. Explain that members can work on tasks they have access to.

> “The app checks permissions on the server, not only in the page. This helps
> make sure that a user cannot perform an action just by changing the browser
> interface.”

## 4. Challenges and how they were handled

### A good general answer

> “One of the main challenges was building sign-in and role-based task
> permissions in Next.js. Workspace owners and members have different
> permissions, so the server must check who is signed in and what they are
> allowed to do before it changes data.
>
> I also had to handle MongoDB connections and check workspace membership
> before carrying out workspace actions. For server actions, I used
> authentication and Zod validation, and kept permission checks on the server
> instead of trusting the page.
>
> Comments also needed permission rules, such as allowing a member to edit
> their own comment and restricting comment deletion to the owner.
>
> During development, I ran into TypeScript and Next.js type errors. I learned
> to read the error messages, use the compiler, and solve one issue at a time
> instead of changing code randomly.”

### If they ask for one specific problem

> “One specific problem was deciding who could change a task's status. The
> workspace owner should be able to move any task. A member should only be
> able to move a task assigned to them, and only through the allowed order:
> To Do, then In Progress, then Done.
>
> At first, I considered checking this in the page. But a user can bypass page
> controls, so that would not be enough. I put the important checks in the
> server action instead. Before saving the change, the server checks the
> signed-in user, workspace membership, role, task assignment, and allowed
> status change.
>
> This taught me that the user interface can guide people, but the server must
> enforce permissions.”

This answer follows a simple order: **problem, investigation, solution, and
what you learned**. Be ready to show the relevant code or explain the exact
rules you implemented.

### Other useful examples

- Keeping server-rendered pages and browser behavior consistent, such as when
  loading the saved theme.
- Adding tests for important flows such as sign-in, creating a task, and
  adding a comment.

Only describe details you personally worked on or can explain. If asked about a
technical issue you did not handle, it is fine to say you would investigate it.

## 5. What I would improve

> “I would add server-side search and pagination so large workspaces stay fast.
> I would also add browser-based end-to-end tests and tests that use a temporary
> real database. If users need to see updates immediately, I would explore
> real-time updates.”

## 6. Short closing

> “TaskFlow gave me practice building a full-stack application, from sign-in
> and data storage to permissions, collaborative features, and automated tests.
> My next step would be to improve testing and performance as the amount of
> workspace data grows.”

## Before the interview

- Run the app and sign in with a working account.
- Choose a workspace that already has a few tasks and comments.
- Decide which two or three features you will show.
- Check that your local database and environment variables are set up.
- Do not show passwords, secret keys, or private user information while sharing
  your screen.
