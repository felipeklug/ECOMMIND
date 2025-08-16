---
description: 
globs: 
alwaysApply: true
type: "always_apply"
---
---
description: Standardized commit message format to ensure clear communication and maintainable git history
globs: ["**/*"]
alwaysApply: false
---
- Version: 1.0.0

# Commit Message Standards

## Purpose & Scope

This rule establishes standardized commit message conventions to ensure:
- Clear communication about changes in the codebase
- Maintainable and searchable git history
- Ability to generate accurate changelogs
- Consistent project documentation

## Implementation Guidelines

- Always structure commit messages using the conventional commits format
- Include one of the required type prefixes followed by an optional scope in parentheses
- Add a colon and space after the type/scope
- Write a concise description in present tense, imperative mood
- For complex changes, include a more detailed body after a blank line
- End commit messages to users with the commit reminder emoji

### Required Type Prefixes

| Type       | Description                                          |
|------------|------------------------------------------------------|
| `feat`     | New features or significant functionality additions   |
| `fix`      | Bug fixes or error corrections                        |
| `docs`     | Documentation changes only                           |
| `style`    | Code style/formatting changes (no functionality change) |
| `refactor` | Code changes that neither fix bugs nor add features   |
| `test`     | Adding/updating tests                                |
| `chore`    | Maintenance tasks, dependency updates, etc.          |
| `perf`     | Performance improvements                             |
| `ci`       | CI/CD configuration changes                          |
| `build`    | Build system or external dependency changes          |

### Examples

```
✅ DO:
feat(auth): implement login with Clerk
fix(api): resolve data fetching error in events endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting functions
style(components): apply consistent indentation
test(unit): add tests for event creation
chore(deps): update Tailwind to latest version
perf(dashboard): optimize rendering of event list
```

```
❌ DON'T:
added login
fixed bug
updated readme
changes
wip
```

### Breaking Changes

- For changes that break backward compatibility, add `!` after the type/scope
- Example: `feat(api)!: change response format of events endpoint`
- Include `BREAKING CHANGE:` in the commit body with explanation

## Commit Reminder

When providing instructions to users that include code changes, always end your message with:

> 💾 Don't forget to commit!

### Examples
```
I've updated the auth component with the new Clerk integration.

💾 Don't forget to commit!
```

## Related Rules
- dev_workflow.mdc - Development workflow process guidelines
