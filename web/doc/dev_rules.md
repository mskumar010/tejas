# before making major changes re verify yourself and make use it dont break any other existing functionality

# Terminology

- Use "Status Section" instead of "Category" across the app logic and UI.
- Use "Register", "Login", "Logout". Do NOT use "Sign In", "Sign Up", "Sign Out".
- Use lazy loading and aliases (@/) across the app. Check everything and implement without messing.
  use a centralized colors file

This document outlines the coding standards, best practices, and rules to follow when developing EchoRoom across all platforms (Web, Server, Mobile).

---

## 📋 Table of Contents

1. [TypeScript Type Safety Rules](#typescript-type-safety-rules)
2. [Web Development Rules](#web-development-rules)
3. [Server Development Rules](#server-development-rules)
4. [Mobile Development Rules](#mobile-development-rules)
5. [General Best Practices](#general-best-practices)

---

## 🔒 TypeScript Type Safety Rules

### Core Principle

**Always prefer type safety over convenience. Use the most specific type possible.**

### `any` - The Last Resort

**❌ NEVER use `any` unless absolutely necessary**

**When to use `any`:**

- Only when integrating with JavaScript libraries that have no type definitions
- As a temporary workaround during development (must be fixed before merge)
- When dealing with truly dynamic code that cannot be typed

**Rules:**

1. **Always add a TODO comment** explaining why `any` is used
2. **Must be reviewed** before merging to main
3. **Prefer `unknown`** if you need to accept any value but want type safety

**Example:**

```typescript
// ❌ BAD
function processData(data: any) {
  return data.value;
}

// ✅ GOOD - Use unknown and type guard
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}

// ✅ ACCEPTABLE - With TODO (temporary)
// TODO: Replace with proper types when library types are available
function handleSocketError(error: any) {
  console.error(error?.message || "Unknown error");
}
```

### `unknown` - The Safe Default

**✅ ALWAYS use `unknown` when type is uncertain**

**When to use `unknown`:**

- Handling external data (API responses, user input)
- Dynamic values from third-party libraries
- Values that need validation before use
- Event handlers where event type is uncertain

**Rules:**

1. **Must perform type narrowing** before using the value
2. **Use type guards** (typeof, instanceof, custom guards)
3. **Never access properties** without type checking

**Example:**

```typescript
// ✅ GOOD
function handleApiResponse(response: unknown) {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as { data: User[] }).data;
  }
  throw new Error("Invalid API response");
}

// ✅ GOOD - Custom type guard
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    typeof (obj as { id: unknown }).id === "string"
  );
}
```

### `never` - The Exhaustive Type

**✅ Use `never` for impossible states**

**When to use `never`:**

- Functions that always throw errors
- Functions that never return (infinite loops)
- Exhaustive type checking in switch/if statements
- Conditional types to eliminate union branches

**Rules:**

1. **Use in error handlers** that always throw
2. **Use in exhaustive checks** to catch unhandled cases
3. **Use in type narrowing** to ensure all cases are handled

**Example:**

```typescript
// ✅ GOOD - Function that never returns
function throwError(message: string): never {
  throw new Error(message);
}

// ✅ GOOD - Exhaustive type checking
type Status = "loading" | "success" | "error";

function handleStatus(status: Status) {
  switch (status) {
    case "loading":
      return "Loading...";
    case "success":
      return "Done!";
    case "error":
      return "Failed!";
    default:
      // TypeScript error if Status type is extended without handling
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

### Explicit Error Handling

**✅ ALWAYS specify error type or message**

**❌ NEVER throw unknown/generic errors**

**Rules:**

1. **Throw specific `Error` instances** (e.g. `new Error('User not found')`, not just strings or `null`).
2. **Do not re-throw generic errors**: If catching and re-throwing, add context.
3. **Specify the error**: When handling errors, narrow the type or check properties (e.g. `message`, `code`). Avoid acting on "unknown" errors blindly.

**Example:**

```typescript
// ❌ BAD
throw "Something went wrong";
try { ... } catch (e) { throw e; } // Lost context

// ✅ GOOD
throw new Error("Failed to load user: ID is missing");

try {
  await api.get('/users');
} catch (error: unknown) {
  const message = (error as Error).message || "Unknown API Error";
  throw new Error(`User fetch failed: ${message}`);
}
```

### Type Safety Checklist

Before committing code, verify:

- [ ] No `any` types (unless documented with TODO)
- [ ] All `unknown` values are type-narrowed before use
- [ ] All functions have explicit return types
- [ ] All props/interfaces are properly typed
- [ ] No implicit `any` from missing types

---


# always mobile first design