# Backend Implementation Plan

## Overview

Implement backend for presentations and users management using AWS Lambda + API Gateway + DynamoDB.

## Routing Changes

### Frontend Routes

- **Dashboard**: `/{username}` (instead of `/dashboard`)
- **Presentation**: `/{username}/{slug}`

### Backend API Routes

```
GET    /users/{username}/presentations              # List presentations
GET    /users/{username}/presentations/{slug}       # Get by slug
POST   /users/{username}/presentations              # Create
PUT    /users/{username}/presentations/{slug}       # Update
DELETE /users/{username}/presentations/{slug}       # Delete
```

## Database Schema

### DynamoDB: `mostage-studio-presentations-{env}`

**Partition Key**: `presentationId` (UUID)

**Attributes**:

```typescript
{
  presentationId: string; // UUID (Partition Key)
  userId: string; // Cognito User ID
  username: string; // Username
  name: string; // Presentation name
  slug: string; // URL-friendly identifier
  markdown: string; // Markdown content
  config: PresentationConfig; // JSON object
  isPublic: boolean; // Public/Private flag
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

**GSI Indexes**:

1. `username-index`: Partition Key = `username`
2. `username-slug-index`: Partition Key = `username`, Sort Key = `slug` (unique per user)

### DynamoDB: `mostage-studio-users-{env}`

**Partition Key**: `userId` (Cognito User ID)

**Attributes**:

```typescript
{
  userId: string;    // Cognito User ID (Partition Key)
  username: string;  // Username (GSI: username-index, unique)
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

**GSI**: `username-index` (Partition Key = `username`, unique)

## Lambda Functions

### 1. List Presentations

**File**: `backend/src/lambda/presentations/list.ts`  
**Route**: `GET /users/{username}/presentations`

**Logic**:

- If `username` matches authenticated user → return all (public + private)
- Otherwise → return only public presentations

### 2. Get Presentation

**File**: `backend/src/lambda/presentations/get.ts`  
**Route**: `GET /users/{username}/presentations/{slug}`

**Logic**:

- If `username` matches authenticated user → return (even if private)
- Otherwise → return only if `isPublic: true`, else 404

### 3. Create Presentation

**File**: `backend/src/lambda/presentations/create.ts`  
**Route**: `POST /users/{username}/presentations`

**Authorization**: Only if `username` matches authenticated user

**Body**:

```typescript
{
  name: string;
  slug: string;
  markdown: string;
  config: PresentationConfig;
  isPublic: boolean;
}
```

**Validation**: `slug` must be unique per user and URL-friendly

### 4. Update Presentation

**File**: `backend/src/lambda/presentations/update.ts`  
**Route**: `PUT /users/{username}/presentations/{slug}`

**Authorization**: Only if `username` matches authenticated user

**Body** (all optional):

```typescript
{
  name?: string;
  slug?: string;
  markdown?: string;
  config?: PresentationConfig;
  isPublic?: boolean;
}
```

### 5. Delete Presentation

**File**: `backend/src/lambda/presentations/delete.ts`  
**Route**: `DELETE /users/{username}/presentations/{slug}`

**Authorization**: Only if `username` matches authenticated user

### 6. Get User Info

**File**: `backend/src/lambda/users/get.ts`  
**Route**: `GET /users/{username}`

**Returns**: Public user info (name, avatar, createdAt)

## Default Sample Presentation

**Trigger**: User registration (Cognito Post Confirmation)

**Source**: `frontend/public/samples/basic/`

- `content.md` → `markdown`
- `config.json` → `config`

**Lambda**: `backend/src/lambda/users/createDefaultPresentation.ts`

**Logic**:

1. Get `userId` and `username` from Cognito event
2. Read sample files (from S3 or embedded in Lambda)
3. Create presentation:
   - `name`: "Welcome to Mostage Studio"
   - `slug`: "welcome"
   - `markdown`: content from `content.md`
   - `config`: content from `config.json`
   - `isPublic`: `false`

## Infrastructure (CDK)

### DynamoDB

**File**: `infrastructure/lib/services/dynamodb/index.ts`

- Create `presentations` and `users` tables
- Configure GSI indexes
- Set IAM permissions

### Lambda Functions

**File**: `infrastructure/lib/services/api/presentations/index.ts`

- Create Lambda functions for presentations
- Connect to API Gateway
- Set environment variables and IAM roles

**File**: `infrastructure/lib/services/api/users/index.ts`

- Create Lambda functions for users
- Connect to API Gateway

### Cognito Trigger

**File**: `infrastructure/lib/services/cognito/index.ts`

- Add Post Confirmation Lambda Trigger
- Connect to `createDefaultPresentation` Lambda

## Frontend Changes

### Routes

- `frontend/src/app/[username]/page.tsx` → Dashboard with API
- `frontend/src/app/[username]/[slug]/page.tsx` (new) → Presentation view/edit
- `frontend/src/app/dashboard/page.tsx` → Remove or redirect to `/{username}`

### Service Layer

**File**: `frontend/src/features/presentation/services/presentationService.ts` (new)

```typescript
export async function getPresentations(
  username: string
): Promise<Presentation[]>;
export async function getPresentation(
  username: string,
  slug: string
): Promise<Presentation>;
export async function createPresentation(
  username: string,
  data: CreatePresentationRequest
);
export async function updatePresentation(
  username: string,
  slug: string,
  data: UpdatePresentationRequest
);
export async function deletePresentation(username: string, slug: string);
```

## Environment Variables

### Lambda

```env
PRESENTATIONS_TABLE_NAME=mostage-studio-presentations-dev
USERS_TABLE_NAME=mostage-studio-users-dev
COGNITO_USER_POOL_ID=eu-central-1_xxxxx
COGNITO_REGION=eu-central-1
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://xxxxx.execute-api.eu-central-1.amazonaws.com/dev
```

## Security

- All endpoints (except GET public) require JWT token
- Check `username` in URL matches `username` in token
- Only owner can create/update/delete
- Input validation and slug validation

## Deployment Order

1. DynamoDB Tables
2. Lambda Functions
3. API Gateway
4. Cognito Trigger
5. Frontend Updates

## Implementation Tasks (Incremental & Testable)

### Phase 1: Database Setup

#### Task 1.1: Create DynamoDB Tables

- [ ] Create `infrastructure/lib/services/dynamodb/index.ts`
- [ ] Define `PresentationsTable` with GSI indexes
- [ ] Define `UsersTable` with GSI index
- [ ] Add to CDK stack
- [ ] Deploy: `npm run deploy:dev`
- [ ] Test: Verify tables exist in AWS Console

#### Task 1.2: Create Types & Utilities

- [ ] Create `backend/src/types/presentation.ts`
- [ ] Create `backend/src/types/user.ts`
- [ ] Create `backend/src/utils/dynamodb.ts` (helper functions)
- [ ] Create `backend/src/utils/auth.ts` (JWT token extraction)
- [ ] Test: Run TypeScript compiler: `cd backend && npx tsc --noEmit`

### Phase 2: Lambda Functions - Presentations

#### Task 2.1: List Presentations Lambda

- [ ] Create `backend/src/lambda/presentations/list.ts`
- [ ] Implement authorization logic (username check)
- [ ] Query DynamoDB using GSI `username-index`
- [ ] Filter public/private based on authorization
- [ ] Add to CDK: `infrastructure/lib/services/api/presentations/index.ts`
- [ ] Deploy: `npm run deploy:dev`
- [ ] Test: Call API endpoint with Postman/curl
  ```bash
  curl -X GET "https://API_URL/users/john/presentations" \
    -H "Authorization: Bearer TOKEN"
  ```

#### Task 2.2: Get Presentation Lambda

- [ ] Create `backend/src/lambda/presentations/get.ts`
- [ ] Implement authorization logic
- [ ] Query DynamoDB using GSI `username-slug-index`
- [ ] Return 404 if not found or not authorized
- [ ] Add to CDK
- [ ] Deploy
- [ ] Test: Call API endpoint
  ```bash
  curl -X GET "https://API_URL/users/john/presentations/welcome"
  ```

#### Task 2.3: Create Presentation Lambda

- [ ] Create `backend/src/lambda/presentations/create.ts`
- [ ] Implement authorization check
- [ ] Validate slug (URL-friendly, unique per user)
- [ ] Generate UUID for `presentationId`
- [ ] Insert into DynamoDB
- [ ] Add to CDK
- [ ] Deploy
- [ ] Test: Create presentation via API
  ```bash
  curl -X POST "https://API_URL/users/john/presentations" \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","slug":"test","markdown":"# Hello","config":{},"isPublic":false}'
  ```

#### Task 2.4: Update Presentation Lambda

- [ ] Create `backend/src/lambda/presentations/update.ts`
- [ ] Implement authorization check
- [ ] Validate slug uniqueness if changed
- [ ] Update DynamoDB item
- [ ] Update `updatedAt` timestamp
- [ ] Add to CDK
- [ ] Deploy
- [ ] Test: Update presentation via API

#### Task 2.5: Delete Presentation Lambda

- [ ] Create `backend/src/lambda/presentations/delete.ts`
- [ ] Implement authorization check
- [ ] Delete from DynamoDB
- [ ] Add to CDK
- [ ] Deploy
- [ ] Test: Delete presentation via API

### Phase 3: Lambda Functions - Users

#### Task 3.1: Get User Lambda

- [ ] Create `backend/src/lambda/users/get.ts`
- [ ] Query DynamoDB `UsersTable` by username (GSI)
- [ ] Return public user info only
- [ ] Add to CDK: `infrastructure/lib/services/api/users/index.ts`
- [ ] Deploy
- [ ] Test: Get user info via API
  ```bash
  curl -X GET "https://API_URL/users/john"
  ```

#### Task 3.2: Create Default Presentation Lambda

- [ ] Create `backend/src/lambda/users/createDefaultPresentation.ts`
- [ ] Read sample files (`content.md` and `config.json`)
- [ ] Create presentation with sample data
- [ ] Insert into DynamoDB
- [ ] Add to CDK
- [ ] Test: Manually invoke Lambda with test event
  ```bash
  aws lambda invoke --function-name FUNCTION_NAME --payload '{"userId":"test","username":"test"}' response.json
  ```

### Phase 4: Cognito Integration

#### Task 4.1: Add Cognito Post Confirmation Trigger

- [ ] Update `infrastructure/lib/services/cognito/index.ts`
- [ ] Add Post Confirmation Lambda Trigger
- [ ] Connect to `createDefaultPresentation` Lambda
- [ ] Deploy
- [ ] Test: Register new user and verify default presentation is created

### Phase 5: Frontend Integration

#### Task 5.1: Create Presentation Service

- [ ] Create `frontend/src/features/presentation/services/presentationService.ts`
- [ ] Implement `getPresentations(username)`
- [ ] Implement `getPresentation(username, slug)`
- [ ] Implement `createPresentation(username, data)`
- [ ] Implement `updatePresentation(username, slug, data)`
- [ ] Implement `deletePresentation(username, slug)`
- [ ] Test: Import and call functions in browser console

#### Task 5.2: Update Dashboard Page

- [ ] Update `frontend/src/app/[username]/page.tsx`
- [ ] Replace mock data with API call
- [ ] Add loading state
- [ ] Add error handling
- [ ] Test: Navigate to `/{username}` and verify presentations load

#### Task 5.3: Create Presentation Page

- [ ] Create `frontend/src/app/[username]/[slug]/page.tsx`
- [ ] Fetch presentation from API
- [ ] Display presentation using Mostage
- [ ] Add edit mode (if owner)
- [ ] Test: Navigate to `/{username}/{slug}` and verify presentation displays

#### Task 5.4: Remove/Redirect Dashboard

- [ ] Update `frontend/src/app/dashboard/page.tsx`
- [ ] Redirect to `/{username}` or remove entirely
- [ ] Test: Navigate to `/dashboard` and verify redirect

### Phase 6: End-to-End Testing

#### Task 6.1: Test User Registration Flow

- [ ] Register new user
- [ ] Verify default presentation is created
- [ ] Verify can access `/{username}` and see default presentation
- [ ] Verify can access `/{username}/welcome`

#### Task 6.2: Test Presentation CRUD

- [ ] Create new presentation via API
- [ ] Verify appears in dashboard
- [ ] Update presentation
- [ ] Verify changes reflected
- [ ] Delete presentation
- [ ] Verify removed from dashboard

#### Task 6.3: Test Authorization

- [ ] Try to access another user's private presentation → should fail
- [ ] Try to update another user's presentation → should fail
- [ ] Try to delete another user's presentation → should fail
- [ ] Access public presentation of another user → should succeed

## Testing Checklist

After each task, verify:

- [ ] Lambda function compiles without errors
- [ ] Lambda function deploys successfully
- [ ] API endpoint is accessible
- [ ] Authorization works correctly
- [ ] DynamoDB operations succeed
- [ ] Error handling works (404, 403, 400)
- [ ] Frontend can call API successfully
