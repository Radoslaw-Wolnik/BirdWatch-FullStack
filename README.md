# BirdWatch

A community-driven bird-watching application built with Next.js, allowing users to share and explore bird sightings.

## Features

- User authentication and authorization
- Bird sighting posts with location, species, and optional photos
- Friend system for connecting with other bird enthusiasts
- Moderation system for ensuring content quality
- Interactive map view of bird sightings
- User profiles and activity feeds
- Dark mode support

## Tech Stack

- Framework: Next.js 14 with TypeScript
- Frontend: React with Tailwind CSS
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth.js

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/birdwatch.git
   cd birdwatch
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/birdwatch
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Set up the database:
   ```
   npx prisma db push
   ```

5. Create uploads directory for images:
   ```
   mkdir -p public/uploads
   ```

6. Run the development server:
   ```
   npm run dev
   ```

The server should now be running on `http://localhost:3000`.

## Usage

1. Register a new user account through the web interface.
2. Log in to access the dashboard.
3. Create bird sighting posts, including location, species, and optional photos.
4. Explore the map view to see bird sightings in your area.
5. Connect with other users by sending friend requests.
6. Moderate content if you have moderator privileges.

For detailed API documentation, please refer to the [API.md](API.md) file.

## Development

The project is set up for development with hot reloading. Simply run:

```
npm run dev
```

## Testing

Run the test suite with:

```
npm test
```

## Deployment

For production deployment:

1. Build the project:
   ```
   npm run build
   ```

2. Start the server:
   ```
   npm start
   ```

Consider using a service like Vercel for easy deployment of Next.js applications.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.