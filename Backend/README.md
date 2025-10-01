# EduNet Backend

A comprehensive educational platform backend built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure signup/login with email verification
- **Virtual Classrooms**: Create and manage private classrooms
- **Real-time Chat**: Socket.IO powered messaging with AI integration
- **Video Meetings**: WebRTC-based video conferencing with recording
- **Meeting Transcription**: Automatic speech-to-text using Deepgram
- **AI-Powered Summarization**: Meeting summaries generated using Gemini AI
- **File Management**: Notes and assignment uploads with content filtering
- **Announcements & Assignments**: Classroom management tools

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `EMAIL_USER` & `EMAIL_PASS`: Gmail credentials for email verification
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `DEEPGRAM_API_KEY`: Deepgram API key for transcription
- `CLOUDINARY_*`: Cloudinary credentials for image uploads
- `B2_*`: Backblaze B2 credentials for file storage

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB

Ensure MongoDB is running on your system.

### 4. Run the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on:
- HTTP Server: `http://localhost:5000`
- Socket.IO Server: `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /signup` - User registration with email verification
- `POST /login` - User login
- `GET /verify-email/:token` - Email verification

### Classrooms
- `POST /addClass` - Create a new class
- `POST /fetchClass` - Get all classes
- `POST /createPrivateClassroom` - Create private classroom
- `POST /getPrivateClassrooms` - Get classrooms for user

### Chat & Messaging
- `POST /sendMessage` - Send chat message
- `POST /fetchChats` - Get chat history
- Socket events for real-time messaging

### Meetings & Transcription
- `POST /uploadAudio` - Upload meeting audio for transcription
- Automatic Deepgram transcription
- AI-powered summarization with Gemini

### Notes & Assignments
- `POST /notes` - Upload notes with content filtering
- `POST /getnotes` - Retrieve classroom notes
- `POST /createAssignment` - Create assignments
- `POST /submitAssignment` - Submit assignment solutions

## Architecture

- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for chat and video signaling
- **File Storage**: Backblaze B2 for scalable file storage
- **AI Services**: 
  - Gemini AI for content moderation and summarization
  - Deepgram for speech-to-text transcription
- **Authentication**: JWT-based with email verification

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Content appropriateness filtering
- File type and size validation
- Environment-based configuration

## Development

The project uses:
- `nodemon` for development auto-restart
- Environment variables for configuration
- Modular code structure
- Error handling and logging

## License

ISC License