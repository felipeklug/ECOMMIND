---
description: 
globs: 
alwaysApply: true
type: "always_apply"
---
# Memory Management Protocol - Version: 1.0.0

## Purpose & Scope

This rule outlines the **critical protocol** for consulting and maintaining persistent knowledge to enhance AI performance, ensure consistency, and prevent the repetition of errors. It governs the interaction with dedicated memory files that store project-specific information, learned corrections, API documentation, database schemas, user coding preferences, and application features. Adherence to this protocol is mandatory for all AI interactions.

## Implementation Guidelines

### Core Operational Mandates:

1.  **Initial Memory Scan (MANDATORY FIRST STEP):**
    *   **MUST**: At the absolute beginning of every user request processing, read the content of:
        *   `@project.mdc` (for project-specific guidelines and overarching project context)
        *   `@preferences.mdc` (for user-specific, one-line coding preferences)
    *   This initial scan is crucial for context awareness and error prevention.

2.  **Targeted Memory Consultation (AS NEEDED):**
    *   **MUST**: When the user's query or the ongoing task involves database interactions, consult:
        *   `@database-schema.mdc` (for current table structures, relationships, functions, etc.)
    *   **MUST**: When the user's query or the ongoing task involves API interactions (either consuming or defining):
        *   `@apis.mdc` (for existing API endpoints, request/response formats, authentication)
    *   **MUST**: When working with specific app features, consult relevant files in:
        *   `.cursor/features/` directory (for feature-specific documentation and implementation details)
    *   **SHOULD**: When encountering errors or debugging, check for similar issues in:
        *   `.cursor/mistakes/` directory (for previously encountered and resolved errors)

3.  **Proactive Update Protocol (MANDATORY FINAL STEP):**
    *   **MUST**: At the conclusion of processing every user request, and *before* sending the final response to the user, explicitly review if any of the following memory locations require updates based on the interaction:
        *   `.cursor/mistakes/[error-category].md`: If any mistake was made and corrected, or a significant error was resolved.
        *   `.cursor/features/[feature-name].md`: If any new feature was implemented, or existing feature behavior was modified.
        *   `@project.mdc`: If any new project standard or global context was established or clarified.
        *   `@preferences.mdc`: If any user coding preference was added, modified, or clarified.
        *   `@database-schema.mdc`: If any database schema elements (tables, columns, functions, relationships, etc.) were created, modified, or deleted.
        *   `@apis.mdc`: If any API endpoints were created, modified, or deleted, or if their documented behavior changed.
    *   **MUST**: If an update is deemed necessary for any of these files, perform the update using the `edit_file` tool.
    *   **Confirmation**: Explicitly state in your thought process or a (silent) note if you checked for updates and whether any were made.

### Specific Memory File Management:

#### 1. `.cursor/mistakes/[error-category].md` (Distributed Error Documentation)
    *   **Trigger for Update:** Any time an incorrect or suboptimal output is detected and corrected, or a significant error is resolved.
    *   **File Organization:**
        *   Create separate .md files for different error categories (e.g., `database-errors.md`, `authentication-issues.md`, `ui-bugs.md`)
        *   Use descriptive filenames that clearly indicate the error domain
    *   **Action:**
        *   Create or update the appropriate category file in `.cursor/mistakes/`
        *   Use the format:
            ```markdown
            # [Error Category] - Common Issues and Solutions
            
            ## [Specific Error Name] - [Date/Version]
            
            **Problem Description:**
            [Detailed description of the error encountered]
            
            **Wrong Approach:**
            ```[language]
            [Insert incorrect code, logic, or statement]
            ```
            
            **Correct Solution:**
            ```[language]
            [Insert corrected code, logic, or statement]
            ```
            
            **Root Cause:** [Explain why the error occurred]
            **Prevention:** [How to avoid this error in the future]
            **Related Files:** [List of files that were affected or modified]
            ```
    *   **Goal:** Create a searchable knowledge base of resolved errors to prevent repetition and speed up debugging.

#### 2. `.cursor/features/[feature-name].md` (Feature Documentation)
    *   **Trigger for Update:** Implementation of new features, modification of existing features, or clarification of feature behavior.
    *   **File Organization:**
        *   Create separate .md files for each major feature (e.g., `chat-system.md`, `image-generation.md`, `user-authentication.md`)
        *   Use kebab-case naming for consistency
    *   **Action:**
        *   Create or update the appropriate feature file in `.cursor/features/`
        *   Use the format:
            ```markdown
            # [Feature Name] - Implementation Guide
            
            ## Overview
            [Brief description of what the feature does and its purpose]
            
            ## Architecture
            [High-level architecture and data flow]
            
            ## Key Components
            - **Component 1:** [Path and description]
            - **Component 2:** [Path and description]
            
            ## API Endpoints
            [List relevant API routes and their purposes]
            
            ## Database Schema
            [List relevant tables and their relationships]
            
            ## Configuration
            [Environment variables, settings, etc.]
            
            ## Common Issues
            [Link to related mistake files or common problems]
            
            ## Testing Strategy
            [How to test this feature]
            
            ## Last Updated
            [Date and brief description of last significant change]
            ```
    *   **Goal:** Maintain comprehensive documentation of app features for better understanding and maintenance.

#### 3. `@project.mdc` (Project Context & Standards)
    *   **Trigger for Update:** Identification or clarification of any new project-wide standard (e.g., architectural patterns), or significant contextual information *not* covered by user preferences or feature-specific documentation.
    *   **Action:** Add or update the relevant section in `@project.mdc` to reflect this new information.
    *   **Goal:** Ensure the AI consistently adheres to project-specific requirements.

#### 4. `@preferences.mdc` (User Coding Preferences)
    *   **Trigger for Update:** Identification, clarification, or modification of any user-specific coding preference (e.g., preferred shell, tools, libraries, specific coding styles or prohibitions).
    *   **Action:** Add or update the relevant one-line preference in `@preferences.mdc`.
    *   **Goal:** Ensure the AI consistently adheres to user-specific coding choices and directives.

#### 5. `@database-schema.mdc` (Database Schema Documentation)
    *   **Trigger for Update:** Any DDL change or structural modification to the database (e.g., creating/altering tables, columns, views, functions, triggers, relationships, cascade actions).
    *   **Action:** Update `@database-schema.mdc` to accurately reflect the current state of the database schema. Include table definitions, column types, relationships, and any relevant constraints or functions.
    *   **Goal:** Maintain an up-to-date reference for all database-related code generation and queries.

#### 6. `@apis.mdc` (API Endpoint Documentation)
    *   **Trigger for Update:** Creation, modification, or deletion of any API endpoint, or changes to its request/response format, authentication, or core behavior.
    *   **Action:** Update `@apis.mdc` with the new/modified API endpoint details. Document the path, HTTP method, purpose, request parameters/body, response structure, and authentication requirements.
    *   **Goal:** Provide a reliable, current specification for all APIs in the project.

### General Memory Hygiene:
    *   **Clarity and Structure:** Keep memory files well-structured with clear headings (e.g., using `###`). Group related information.
    *   **Relevance:** Ensure information saved is generally applicable and reusable, not overly specific to a single, transient request.
    *   **Conciseness:** Be clear but avoid excessive verbosity.
    *   **Up-to-Date:** If a better solution or understanding for a logged item is found, update the existing entry.
    *   **File Organization:** Use descriptive filenames and maintain consistent naming conventions across directories.
    *   **Cross-References:** Link related mistakes, features, and documentation where appropriate.

## Storage Paths
- **Error Documentation:** `.cursor/mistakes/[error-category].md` (distributed error documentation)
- **Feature Documentation:** `.cursor/features/[feature-name].md` (feature-specific documentation)
- **Project Context & Standards:** `.cursor/rules/project.mdc`
- **User Coding Preferences:** `.cursor/rules/code-preferences.mdc`
- **Database Schema:** `.cursor/rules/database-schema.mdc`
- **API Documentation:** `.cursor/rules/apis.mdc`

## Directory Structure Examples
```
.cursor/
├── mistakes/
│   ├── database-errors.md
│   ├── authentication-issues.md
│   ├── ui-component-bugs.md
│   ├── api-integration-problems.md
│   └── deployment-issues.md
├── features/
│   ├── chat-system.md
│   ├── image-generation.md
│   ├── user-authentication.md
│   ├── subscription-management.md
│   └── admin-panel.md
```

## Enforcement
- **CRITICAL ERROR:** Failure to perform the **Initial Memory Scan** at the start of a request.
- **CRITICAL ERROR:** Failure to perform the **Proactive Update Protocol** (checking and making necessary updates to memory files) at the end of a request.
- All AI-generated outputs and actions **MUST** be consistent with the information contained within these memory files and directories.

## Suggested Metadata
---
description: "Enhanced memory management protocol with distributed documentation structure - errors in .cursor/mistakes/*.md and features in .cursor/features/*.md for better organization and searchability."
globs: ["**/*"]
alwaysApply: true
---