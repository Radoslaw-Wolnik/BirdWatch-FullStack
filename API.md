# BirdWatch API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Auth Routes](#auth-routes)
3. [Post Routes](#post-routes)
4. [User Routes](#user-routes)
5. [Friend Routes](#friend-routes)
6. [Moderation Routes](#moderation-routes)

## Authentication

Most endpoints require authentication. Authentication is handled using NextAuth.js. When a user logs in successfully, a session will be created. API routes are protected using NextAuth's built-in mechanisms. Authentication requirement is indicated for each endpoint as follows:

- 🔓 No authentication required
- 🔒 User authentication required
- 🔑 Moderator authentication required
- 👑 Admin authentication required

## Auth Routes

#### Register
```
🔓 POST /api/auth/register
Body: { username: string, email: string, password: string }
Response: { message: "User registered successfully" }
```

#### Login (handled by NextAuth)
```
🔓 POST /api/auth/signin
Body: { username: string, password: string }
Response: Redirects to callback URL or homepage
```

#### Logout (handled by NextAuth)
```
🔒 GET /api/auth/signout
Response: Redirects to homepage
```

## Post Routes

#### Create Post
```
🔒 POST /api/posts
Body: { birdSpecies: string[], description: string, latitude: number, longitude: number, photos?: string[], customDate?: Date }
Response: { id: string, ...postData }
```

#### Get Posts
```
🔒 GET /api/posts
Query: { lat: number, lon: number, radius: number, page?: number, limit?: number, species?: string }
Response: { data: [PostObject], meta: { total: number, page: number, limit: number, pages: number } }
```

#### Update Post
```
🔒 PUT /api/posts/[id]
Body: { birdSpecies?: string[], description?: string, photos?: string[] }
Response: { id: string, ...updatedPostData }
```

#### Delete Post
```
🔒 DELETE /api/posts/[id]
Response: { message: "Post deleted successfully" }
```

#### Like/Unlike Post
```
🔒 POST /api/posts/[id]/like
Response: { id: string, likesCount: number }
```

#### Flag Post
```
🔒 POST /api/posts/[id]/flag
Body: { reason: string }
Response: { message: "Post flagged successfully" }
```

## User Routes

#### Get User Profile
```
🔒 GET /api/users/[id]
Response: { id: string, username: string, profilePicture: string, createdAt: Date, role: string, postsCount: number, friendsCount: number }
```

#### Update User Profile
```
🔒 PUT /api/users/[id]
Body: { profilePicture?: string }
Response: { id: string, ...updatedUserData }
```

#### Search Users
```
🔒 GET /api/users/search
Query: { q: string }
Response: [{ id: string, username: string, profilePicture: string }]
```

## Friend Routes

#### Send Friend Request
```
🔒 POST /api/friends/request
Body: { friendId: string }
Response: { message: "Friend request sent" }
```

#### Accept/Decline Friend Request
```
🔒 PUT /api/friends/[requestId]
Body: { action: "accept" | "decline" }
Response: { message: "Friend request accepted/declined" }
```

#### Get Friends List
```
🔒 GET /api/friends
Response: [{ id: string, username: string, profilePicture: string }]
```

## Moderation Routes

#### Get Flagged Posts
```
🔑 GET /api/moderation/flagged
Query: { page?: number, limit?: number }
Response: { data: [FlaggedPostObject], meta: { total: number, page: number, limit: number, pages: number } }
```

#### Resolve Flagged Post
```
🔑 POST /api/moderation/flagged/[id]
Body: { action: "resolve" | "dismiss" }
Response: { message: "Flagged post resolved/dismissed" }
```

#### Get Moderator Requests
```
👑 GET /api/moderation/requests
Query: { page?: number, limit?: number }
Response: { data: [ModeratorRequestObject], meta: { total: number, page: number, limit: number, pages: number } }
```

#### Approve/Reject Moderator Request
```
👑 POST /api/moderation/requests/[id]
Body: { action: "approve" | "reject" }
Response: { message: "Moderator request approved/rejected" }
```

## Notes on API Usage

1. Ensure proper error handling on the client-side for all API calls.
2. Implement appropriate loading states in the UI while waiting for API responses.
3. For real-time features, consider implementing WebSocket connections using Next.js API routes with the `socket.io` library.
4. Implement rate limiting on the server to prevent abuse of the API.
5. Keep authentication tokens secure and implement proper token refresh mechanisms.