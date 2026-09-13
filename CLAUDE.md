# CLAUDE.md — projects/rednote-factory-coze

**XHS Content Factory — Next.js + Coze + SSE**

## Purpose
AI-driven content creation platform for Xiaohongshu. Generates viral XHS notes via Coze bot integration with SSE streaming.

## Stack
Next.js 16, React 19, TypeScript, shadcn/ui, Coze SDK, SSE

## Entry Point
```bash
npm install
npm run dev   # dev server
npm run build # production build
```

## APIs
- `POST /api/generate` — AI content generation (SSE)
- `GET /api/tools` — tool library browsing

## Note
`node_modules/`, `.next/`, `dist/` excluded from this copy. Run `npm install` before use.

## Original
`~/Desktop/slow is the fast/rednote-factory-coze v2/`
