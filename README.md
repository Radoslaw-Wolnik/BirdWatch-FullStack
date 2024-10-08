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

- Node.js (v14 or later)
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

## Deployment

### Standard Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

#### Troubleshooting Standard deployment

If you encounter issues with `@lib` imports or Prisma models not being recognized:

1. Ensure that the `tsconfig.json` file includes the correct path aliases:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@/lib/*": ["./src/lib/*"]
       }
     }
   }
   ```

2. Regenerate Prisma client:
   ```
   npx prisma generate
   ```

3. If using VS Code, restart the TypeScript server:
   - Open the command palette (Ctrl+Shift+P or Cmd+Shift+P)
   - Type "TypeScript: Restart TS Server" and select it

4. Ensure that your `next.config.js` file is properly configured:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     swcMinify: true,
   }
   
   module.exports = nextConfig
   ```

5. Clear Next.js cache:
   ```
   rm -rf .next
   ```

After making these changes, rebuild and restart your development server.

### Docker Deployment

To deploy the application using Docker, follow these steps:

1. Ensure you have Docker and Docker Compose installed on your system.

2. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://user:password@db:5432/birdwatch
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=birdwatch
   ```

3. Create the uploads directory if it doesn't exist:
   ```
   mkdir -p public/uploads
   ```

4. Set the correct permissions for the uploads directory:
   ```
   chmod 777 public/uploads
   ```

5. Build and start the Docker containers:
   ```
   docker-compose up -d --build
   ```

6. Run database migrations:
   ```
   docker-compose exec app npx prisma migrate deploy
   ```

7. The application should now be running at `http://localhost:3000`.

To stop the containers:
```
docker-compose down
```

#### Handling Uploads

The `public/uploads` directory is mounted as a volume in the Docker container. This means that any images uploaded through the application will be stored in this directory on your host machine, ensuring persistence even if the container is stopped or removed.

To back up uploaded images, you can simply copy the `public/uploads` directory from your host machine.

To restore uploads, copy your backed-up `uploads` directory into the `public` folder before starting the Docker containers.

#### Troubleshooting Docker Deployment

- If you encounter issues with file permissions for the uploads directory, ensure that the directory has the correct permissions:
  ```
  chmod -R 777 public/uploads
  ```

- If the database connection fails, make sure the `DATABASE_URL` in your `.env` file uses `db` as the host (the name of the database service in docker-compose.yml).

- To view logs for troubleshooting:
  ```
  docker-compose logs app
  ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.