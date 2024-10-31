# TaskForge 🚀

A powerful project and task management platform built for modern teams.

## Features ✨

- **Workspaces** 🏢
  - Create multiple workspaces for different organizations
  - Customize workspace settings and preferences
  - Manage workspace members and roles

- **Projects** 📊
  - Create and manage multiple projects within workspaces
  - Set project goals and milestones
  - Track project progress and metrics

- **Task Management** ✅
  - Multiple task views:
    - Kanban Board 📋
    - Calendar View 📅
    - List View 📝
  - Task stages:
    - Backlog
    - Todo
    - In Progress
    - In Review
    - Done
  - Rich task details:
    - Descriptions with markdown support
    - File attachments
    - Comments and discussions
    - Due dates and priorities
    - Labels and tags

- **Team Collaboration** 👥
  - Invite team members to workspaces
  - Assign tasks to team members
  - Real-time updates and notifications
  - Team member permissions and roles

## Tech Stack 💻

- **Frontend**:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components

- **Backend**:
  - Hono
  - Appwrite

## Prerequisites 📋

- Node.js 18+ installed
- Appwrite instance (local or cloud)
- npm or yarn package manager

## Installation 🛠️

1. Clone the repository:
```bash
git clone https://github.com/krishkalaria12/Task-Forge.git
cd task-forge
```

2. Install dependencies:
```bash
# Install dependencies
npm install
```

3. Set up environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_STORAGE_ID=
NEXT_PUBLIC_APPWRITE_COLLECTIONS_WORKSPACES_ID=
NEXT_PUBLIC_APPWRITE_COLLECTIONS_MEMBERS_ID=
NEXT_PUBLIC_APPWRITE_COLLECTIONS_PROJECTS_ID=
NEXT_PUBLIC_APPWRITE_COLLECTIONS_TASKS_ID=

NEXT_APPWRITE_KEY=

UPLOADTHING_TOKEN=
```

4. Set up Appwrite:
   - Create a new project in Appwrite Console
   - Set up the following collections:
     - workspaces
     - projects
     - tasks
     - members
   - Configure authentication methods
   - Set up storage for file attachments

## Contributing 🤝

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## Support 💪

If you find any bugs or have feature requests, please create an issue in the GitHub repository.
