# TaskFlow: Project Decisions

**Created:** October 8, 2026 at 11:07 (UTC+05:30)

This document explains the main tools used in TaskFlow, the trade-offs made to
keep the project manageable, and what could be improved in a future version.

## Why these tools?

- **Next.js and React** keep pages and server-side actions in one application.
  This makes it easier to build the interface and handle tasks such as saving
  data without maintaining a separate API service.
- **TypeScript** helps catch mistakes while writing code, especially when
  working with task, user, and workspace data.
- **MongoDB and Mongoose** store the app's data. MongoDB works well with related
  records that can grow as features are added, and Mongoose helps define and
  validate those records.
- **Auth.js and `bcryptjs`** provide sign-in and password hashing. Passwords
  should be stored as hashes, not as readable text.
- **Zod** checks user input before it is used. This helps prevent invalid data
  from entering the application.
- **Tailwind CSS** makes it quick to build and adjust page styles.
- **dnd-kit** provides drag-and-drop behavior for moving tasks on the board.
- **Vitest** runs automated tests for important validation and app flows.

## Trade-offs made to keep work moving

- The app uses one Next.js project instead of separate frontend and backend
  projects. This is simpler to develop and deploy, though a larger team might
  prefer services split by responsibility.
- Task filtering and sorting happen in the browser after tasks are loaded.
  This was straightforward to build, but very large workspaces may need
  server-side search and pagination.
- Task updates are saved, but changes are not sent instantly to other users.
  Real-time updates would need extra infrastructure and more testing.
- Integration tests check key actions with the database layer mocked. They run
  quickly and do not need a database, but they do not prove that every flow
  works against a real MongoDB server.
- Workspace activity records supported events going forward. It does not
  recreate activity from before the feature was added.

## What I would do differently next time

- Add pagination and server-side search before workspaces grow large.
- Add end-to-end tests that run in a browser, and separate tests against a
  temporary database.
- Add real-time updates only when users need to see one another's changes
  immediately.
- Write down access rules for owners and members early, then test each rule
  directly.
- Set up automated checks for tests, linting, and builds whenever code changes
  are submitted.
