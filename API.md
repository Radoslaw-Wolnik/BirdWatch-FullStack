# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Admin Routes](#admin-routes)
3. [Auth Routes](#auth-routes)
4. [Bird Routes](#bird-routes)
5. [Friend Routes](#friend-routes)
6. [Moderator Routes](#moderator-routes)
7. [Post Routes](#post-routes)
8. [Profile Routes](#profile-routes)
9. [Search Routes](#search-routes)
10. [Upload Routes](#upload-routes)

## Authentication

Most endpoints require authentication using NextAuth.js with session-based authentication. Authentication is handled using secure HTTP-only cookies. When a user logs in successfully, a session will be created and maintained through cookies.

Authentication requirement is indicated for each endpoint as follows:
- 🔓 No authentication required
- 🔒 User authentication required
- 🔑 Admin authentication required
- 👥 Moderator authentication required

## Admin Routes

### Get Admin Dashboard
```
🔑 GET /api/admin?action=<action>
Query Parameters: { action: 'inactiveUsers' | 'moderatorRequests' | 'flaggedPosts' }
Response: <Requested Data>
```

### Admin Actions
```
🔑 POST /api/admin
Body: { action: 'deleteUser' | 'approveModerator' | 'deletePost', id: number }
Response: { message: string }
```

### Get Admin Analytics
```
🔑 GET /api/admin/analytics
Response: {
  userStats: { totalUsers: number, newUsersLastWeek: number },
  postStats: { totalPosts: number, newPostsLastWeek: number },
  topBirds: Array<{ id: number, name: string, postCount: number }>,
  topPosters: Array<{ id: number, username: string, postCount: number }>,
  moderationStats: { pendingFlaggedPosts: number }
}
```

## Auth Routes

### Register
```
🔓 POST /api/auth/register
Body: { username: string, email: string, password: string }
Response: SafeUser
```

### NextAuth Routes
```
🔓 [...nextauth] /api/auth/[...nextauth]
Handles all NextAuth.js authentication routes
```

## Bird Routes

### Submit Bird Icon
```
🔒 POST /api/bird-icons
Body: FormData { birdSpecies: string, icon: File }
Response: SafeSubmitBirdIcon
```

### Get Bird Icon Submissions
```
🔒 GET /api/bird-icons
Response: SafeSubmitBirdIcon[]
```

## Friend Routes

### Get User Feed
```
🔒 GET /api/feed
Query Parameters: { page?: number, limit?: number }
Response: Array<BirdPost>
```

### Send Friend Request
```
🔒 POST /api/friends
Body: { friendId: number }
Response: SafeFriendship
```

### Get Friendships
```
🔒 GET /api/friends
Response: SafeFriendship[]
```

### Update Friendship
```
🔒 PUT /api/friendships/:id
Body: { action: 'accept' | 'decline' }
Response: SafeFriendship
```

### Delete Friendship
```
🔒 DELETE /api/friendships/:id
Response: 204 No Content
```

## Moderator Routes

### Submit Moderator Request
```
🔒 POST /api/moderator-requests
Body: { description: string, qualifications: string, location: string }
Response: SafeModeratorRequest
```

### Get Moderator Requests
```
🔑 GET /api/moderator-requests
Response: SafeModeratorRequest[]
```

### Get Flagged Posts (Moderator)
```
👥 GET /api/moderator
Query Parameters: { page?: number, limit?: number, lat?: number, lon?: number }
Response: Array<SafeFlaggedPost>
```

### Handle Flagged Post
```
👥 POST /api/moderator
Body: { flaggedPostId: number, action: 'RESOLVE' | 'DISMISS' }
Response: FlaggedPost
```

## Post Routes

### Create Post
```
🔒 POST /api/posts
Body: { description: string, birdSpecies: string, latitude: number, longitude: number, photos: string[] }
Response: SafeBirdPost
```

### Get Posts
```
🔒 GET /api/posts
Query Parameters: { page?: number, limit?: number, sortBy?: string, order?: 'asc' | 'desc' }
Response: { posts: SafeBirdPost[], totalPages: number, currentPage: number }
```

### Get Single Post
```
🔒 GET /api/posts/:id
Response: SafeBirdPost
```

### Update Post
```
🔒 PUT /api/posts/:id
Body: FormData with post data
Response: SafeBirdPost
```

### Delete Post
```
🔒 DELETE /api/posts/:id
Response: 204 No Content
```

### React to Post
```
🔒 POST /api/posts/:id/reactions
Body: { type: 'like' | 'dislike' }
Response: SafeLike | SafeDislike
```

### Remove Reaction
```
🔒 DELETE /api/posts/:id/reactions
Body: { type: 'like' | 'dislike' }
Response: 204 No Content
```

### Flag Post
```
🔒 POST /api/posts/:id/flag
Body: { reason: string }
Response: SafeFlaggedPost
```

## Profile Routes

### Get User Profile
```
🔒 GET /api/users/profile
Response: SafeUser
```

### Get User Profile by ID
```
🔒 GET /api/users/:id/profile
Response: PublicUser
```

### Update Profile
```
🔒 PUT /api/users/:id/profile
Body: { username?: string, profilePicture?: string }
Response: SafeUser
```

### Update Profile Picture
```
🔒 POST /api/users/:id/profile-picture
Body: FormData { file: File }
Response: { id: number, username: string, profilePicture: string }
```

## Search Routes

### Search Users
```
🔒 GET /api/users/search
Query Parameters: { q: string }
Response: Array<{ id: number, username: string, profilePicture: string }>
```

### Search Content
```
🔒 GET /api/search
Query Parameters: { query: string, type: 'birds' | 'posts', page?: number, limit?: number }
Response: {
  results: Array<SafeBird | SafeBirdPost>,
  pagination: { currentPage: number, totalPages: number, totalItems: number }
}
```

## Map Routes

### Get Map Posts
```
🔒 GET /api/map
Query Parameters: { lat: number, lon: number, radius?: number, species?: string[] }
Response: Array<{ id: number, latitude: number, longitude: number, bird_species: string[] }>
```

## Upload Routes

### Upload File
```
🔒 POST /api/upload
Body: FormData { file: File }
Response: { fileUrl: string }
```