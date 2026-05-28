---
last_updated: 2026-05-20T13:28:33Z
---

# Architecture Design

## System Overview
Full-stack web app with React frontend (shadcn/ui + Tailwind) and Atoms Cloud backend (Auth, Database, AI capabilities). Users authenticate, select business type and content type, then AI generates content stored in the database.

## Tech Stack
- Frontend: React + TypeScript + Vite + shadcn/ui + Tailwind CSS
- Backend: Atoms Cloud (Auth, Database, Edge Functions, AI)
- AI: gpt-5.4 (text generation), gpt-image-2 (image generation)
- SDK: @metagptx/web-sdk for frontend-backend communication

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|

## File Tree Plan
```
frontend/src/
├── pages/
│   ├── Index.tsx          (Landing page)
│   ├── Dashboard.tsx      (Main dashboard)
│   ├── PostGenerator.tsx  (AI post generation)
│   ├── FlyerGenerator.tsx (AI flyer generation)
│   ├── CampaignPlanner.tsx(AI campaign planner)
│   ├── History.tsx        (Content history)
│   └── AuthCallback.tsx   (Auth callback - read-only)
├── components/
│   ├── Header.tsx         (Navigation header)
│   └── ProtectedRoute.tsx (Auth guard)
├── lib/
│   └── client.ts          (Web SDK client)
├── App.tsx                (Router setup)
└── index.css              (Global styles)
```

## Implementation Guide

