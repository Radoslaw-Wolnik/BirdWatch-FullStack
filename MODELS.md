# BirdWatch Models Documentation

This document provides an overview of the data models used in the BirdWatch application. These models are defined using Prisma schema language and represent tables in the PostgreSQL database.

## Table of Contents
1. [User](#user)
2. [BirdPost](#birdpost)
3. [Like](#like)
4. [Friendship](#friendship)
5. [ModeratorRequest](#moderatorrequest)
6. [FlaggedPost](#flaggedpost)

## User

The User model represents registered users of the application.

```prisma
model User {
  id                Int           @id @default(autoincrement())
  username          String        @unique
  email             String        @unique
  password          String
  role              UserRole      @default(USER)
  profilePicture    String?
  createdAt         DateTime      @default(now())
  lastActive        DateTime      @default(now())
  posts             BirdPost[]
  likes             Like[]
  friends           Friendship[]  @relation("UserFriends")
  friendsOf         Friendship[]  @relation("FriendsOfUser")
  moderatorRequests ModeratorRequest[]
  flaggedPosts      FlaggedPost[]
  deactivated       DateTime?
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

## BirdPost

The BirdPost model represents bird sighting posts created by users.

```prisma
model BirdPost {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  birdSpecies String[]
  description String
  latitude    Float
  longitude   Float
  photos      String[]
  createdAt   DateTime  @default(now())
  likes       Like[]
  flags       FlaggedPost[]
}
```

## Like

The Like model represents likes on bird posts.

```prisma
model Like {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  postId    Int
  post      BirdPost @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}
```

## Friendship

The Friendship model represents connections between users.

```prisma
model Friendship {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation("UserFriends", fields: [userId], references: [id])
  friendId  Int
  friend    User     @relation("FriendsOfUser", fields: [friendId], references: [id])
  status    FriendshipStatus
  createdAt DateTime @default(now())

  @@unique([userId, friendId])
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  DECLINED
}
```

## ModeratorRequest

The ModeratorRequest model represents requests from users to become moderators.

```prisma
model ModeratorRequest {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id])
  description  String
  qualifications String
  location     String
  status       RequestStatus @default(PENDING)
  createdAt    DateTime @default(now())
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## FlaggedPost

The FlaggedPost model represents posts that have been flagged for moderation.

```prisma
model FlaggedPost {
  id        Int      @id @default(autoincrement())
  postId    Int
  post      BirdPost @relation(fields: [postId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  reason    String
  status    FlagStatus @default(PENDING)
  createdAt DateTime @default(now())
}

enum FlagStatus {
  PENDING
  RESOLVED
  DISMISSED
}
```

## Relationships

- A User can have multiple BirdPosts (one-to-many)
- A User can have multiple Likes (one-to-many)
- A User can have multiple Friendships (many-to-many through Friendship model)
- A User can have multiple ModeratorRequests (one-to-many)
- A User can flag multiple posts (one-to-many through FlaggedPost model)
- A BirdPost can have multiple Likes (one-to-many)
- A BirdPost can have multiple Flags (one-to-many through FlaggedPost model)

## Indexes

Prisma automatically creates indexes for relation fields and unique fields. For additional performance optimization, consider adding the following indexes:

```prisma
@@index([userId])
@@index([postId])
@@index([createdAt])
```

## Notes

1. All models use auto-incrementing integers for primary keys.
2. Passwords should be hashed before storage in the User model.
3. The `BirdPost` model uses a string array for `birdSpecies` to allow multiple species per post.
4. The `photos` field in `BirdPost` is an array of strings, presumably URLs to uploaded images.
5. Proper error handling should be implemented when interacting with these models, especially for unique constraint violations.
6. Consider implementing data retention policies, especially for the `BirdPost` and `FlaggedPost` models.

To apply these models to your database, use the following Prisma command:

```
npx prisma db push
```

For making changes to the schema, create and apply migrations using:

```
npx prisma migrate dev --name your_migration_name
```