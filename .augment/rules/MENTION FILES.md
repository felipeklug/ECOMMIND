---
description: 
globs: 
alwaysApply: true
type: "always_apply"
---
- Version: 1.0.0

# File Mention Notification

## Purpose & Scope

This rule establishes standards for acknowledging which rule files were accessed or used during the generation of responses. This promotes transparency and helps users understand which guidance documents influenced the AI's approach.

## Implementation Guidelines

- **ALWAYS** list rule files that were accessed or referenced at the end of your response
- Include **ALL** rule files that influenced the current response
- Provide a brief description of each rule's purpose when mentioning it
- Format mentions as a bulleted list under a "Files referenced:" header
- Group related rule files when appropriate
- Include this information even for brief responses

### Examples
```markdown
Files referenced:
- mention-files.mdc - Protocol for acknowledging rule files used in responses
```

```markdown
Files referenced:
- project-structure.mdc - Guidelines for organizing project files and directories
- api-routes.mdc - Standards for implementing API endpoints
- mention-files.mdc - Protocol for acknowledging rule files used in responses
```

### Restrictions
- Never omit file mentions, even if the response seems trivial
- Do not overwhelm the response with lengthy explanations of each file's purpose
- Keep descriptions concise (typically under 10 words)

## Conventions
- Place file mentions at the end of the response
- Use consistent formatting for all file mentions
- Use hyphens for list items

