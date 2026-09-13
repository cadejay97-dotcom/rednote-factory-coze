# Project Audit

**Project**: rednote-factory-coze  
**Audited**: 2026-07-07  
**Auditor**: Claude Code (file-based judgment)

## Classification

| Field | Assessment |
|-------|-----------|
| **Type** | Next.js 16 / React 19 / shadcn UI web app |
| **Status** | Active |
| **Depth score** | HIGH — full stack implementation, Coze API integration, XHS content generation |
| **Production-ready** | Partial — node_modules excluded, needs install |
| **Migration verdict** | APPROVED |

## Judgment Evidence

Found in: `AGENTS.md`  
"小红书内容工厂 - 基于GitHub自媒体创作工具调研报告构建的AI驱动内容创作平台"

## Structure Assessment

```
app/             — Next.js app router
components/      — React UI components
lib/             — utilities, API wrappers
public/          — static assets
package.json     — dependencies
```

## Risks

- `node_modules/` excluded — `npm install` required before running
- Coze API keys likely needed

## Action Items

- [ ] `npm install`
- [ ] Set Coze API key in env
- [ ] `npm run dev`
