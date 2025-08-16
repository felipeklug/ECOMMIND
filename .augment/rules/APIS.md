---
description: 
globs: 
alwaysApply: false
type: "manual"
---
# {My APP Name} API Documentation - Version: 1.0.0

## Purpose & Scope

This document serves as the central repository for documentation on all API endpoints within the {My APP Name} application. It provides details on endpoint paths, HTTP methods, purpose, request/response formats, and authentication requirements.

**MUST** be consulted and updated whenever API endpoints are created, modified, or deleted, as mandated by `@memory.mdc`.

## API endpoint example

---

### `[HTTP_METHOD] /path/to/endpoint`

*   **Purpose:** [Briefly describe what the endpoint does.]
*   **Authentication:** [Specify required authentication (e.g., Supabase user, Public, None, Admin Role).] 
*   **Request Parameters (URL/Query):**
    *   `paramName` (type): [Description, e.g., required, optional, validation rules].
*   **Request Body (JSON):**
    ```json
    {
      "key": "value_type" // Description
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "key": "value_type" // Description
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: [Reason, e.g., Invalid input data.]
    *   `401 Unauthorized`: [Reason, e.g., Missing or invalid authentication token.]
    *   `403 Forbidden`: [Reason, e.g., Insufficient permissions.]
    *   `404 Not Found`: [Reason, e.g., Resource not found.]
    *   `500 Internal Server Error`: [Reason, e.g., Unexpected server error.]
*   **Notes:** [Any additional information, implementation details, or usage notes.]

---

## API Endpoints

Enter APIs here