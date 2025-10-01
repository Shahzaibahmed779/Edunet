const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const app = express();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Dropbox } = require('dropbox');
const server = http.createServer(app);
const { exec } = require("child_process");
const { Deepgram } = require('@deepgram/sdk');
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);



// Load environment variables
require('dotenv').config();

// Use environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is required');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});



// Cloudinary is already configured above - no additional setup needed
console.log('✅ Cloudinary configured for file storage');




// Cloudinary config (keeping for other media if needed)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dropbox configuration for file storage
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
if (!dropboxAccessToken) {
    console.error('❌ DROPBOX_ACCESS_TOKEN environment variable is required');
    process.exit(1);
}

const dbx = new Dropbox({ accessToken: dropboxAccessToken });
console.log('✅ Dropbox API configured for file storage');
// Define a schema for signup data
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
});

// Define a schema for Classes
const classesSchema = new mongoose.Schema({
    classname: { type: String, required: true },
    desc: { type: String, required: true },
    classcode: { type: Number }, // Auto-incremented field
});

// const classesSchema = new mongoose.Schema({
//     classname: { type: String, required: true },
//     desc: { type: String, required: true },
//     classcode: { type: Number }, // Auto-incremented field
//     meetId: { type: String, required: true, unique: true }, // Auto-generated Meet ID for each subject
// });


const privateClassroomSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    useremail: { type: String, required: true },
    classroomid: { type: String, required: true },
    privateclassroomname: { type: String, required: true },
    privateclassroompassword: { type: String, required: true },
});

const chatSchema = new mongoose.Schema({
    privateclassroomid: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }, // Automatically adds the current time
});

const announcementSchema = new mongoose.Schema({
    privateclassroomid: { type: String, required: true },
    email: { type: String, required: true }, // The email of the user creating the announcement
    announcementdata: { type: String, required: true }, // The actual announcement content
    timestamp: { type: Date, default: Date.now }, // Auto-generated timestamp
});

const assignmentSchema = new mongoose.Schema({
    privateclassroomid: { type: String, required: true },
    email: { type: String, required: true }, // The email of the user who created the assignment
    title: { type: String, required: true }, // Assignment title
    desc: { type: String, required: true }, // Assignment description
    duedate: { type: Date, required: true }, // Due date for the assignment
    createdAt: { type: Date, default: Date.now }, // Auto-generated creation timestamp
});

const assignmentSubmissionSchema = new mongoose.Schema({
    assignmentid: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, required: true },
    base64string: { type: String, required: true },  // Store the base64 string as normal text
    filetype: { type: String, required: true },      // Store the file type (e.g., 'application/pdf', 'image/jpeg')
    timestamp: { type: Date, default: Date.now },     // Automatically set the timestamp when the document is created
});

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    fileUrl: { type: String, required: false },
    fileType: { type: String, required: false },
    classroomid: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
    roomName: {
        type: String
    },
    host: {
        type: String,
        require: true
    },
    meetType: {
        type: String,
    },
    meetDate: {
        type: String,
    },
    meetTime: {
        type: String,
    },
    classroomId: {
        type: String,
    },
    participants: {
        type: Array
    },
    currentParticipants: {
        type: Array
    }
}, { timestamps: true });


const MeetingSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    audioUrl: { type: String, required: true },
    transcriptionUrl: { type: String, required: true },
    processedTranscriptionUrl: { type: String }, // New field for processed transcription
    createdAt: { type: Date, default: Date.now }
});


const Meeting = mongoose.model("Meeting", MeetingSchema)
const Rooms = mongoose.model("rooms", RoomSchema);

const Note = mongoose.model('Note', noteSchema);

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

const Assignment = mongoose.model("Assignment", assignmentSchema);

const Announcement = mongoose.model("Announcement", announcementSchema);

const Chat = mongoose.model('Chat', chatSchema);

// Add auto-increment plugin to `classcode`
classesSchema.plugin(AutoIncrement, { inc_field: 'classcode' });

// Create a model for the schema
const Class = mongoose.model('Class', classesSchema);

// Create a model for the schema
const User = mongoose.model('User', userSchema);

const PrivateClassroom = mongoose.model("PrivateClassroom", privateClassroomSchema);




// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'EduNet Backend Server is running!',
        status: 'OK',
        endpoints: {
            signup: 'POST /signup',
            login: 'POST /login',
            notes: 'POST /notes',
            test: 'POST /test-notes-upload'
        }
    });
});

// Files are now served directly from Cloudinary CDN

app.post("/signup", async (req, res) => {
    const { fullname, email, dob, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        console.log("Inside API");

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user in MongoDB with hashed password
        const newUser = new User({
            fullname,
            email,
            dob,
            password: hashedPassword
        });
        await newUser.save();

        // Create a JWT token for email verification
        const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("Sending Email to:", newUser.email);

        // Send verification email using async/await
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: "Verify your email address",
            html: `<h3>Welcome ${newUser.fullname}!</h3>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:5000/verify-email/${token}">Verify Email</a>`,
        };

        // Using promise for sending mail
        const sendMailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            });
        });

        // Wait for the email to be sent
        await sendMailPromise;

        // Respond to the user once email is sent
        return res.status(201).json({ message: "Signup successful! Check your email for verification." });

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Error during signup" });
    }
});

// Email verification route
app.get("/verify-email/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Mark user as verified in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid verification link" });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).send(`
            <html>
                <head>
                    <title>Email Verified</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                        .message { color: #333; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="success">✅ Email Verified Successfully!</div>
                    <div class="message">You can now log in to your account.</div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Invalid or expired verification token" });
    }
});

// Manual verification endpoint for testing (remove in production)
app.post('/manual-verify', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'User verified successfully', user });
    } catch (error) {
        console.error('Error manually verifying user:', error);
        res.status(500).json({ message: 'Error verifying user' });
    }
});

// API to handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email does not exist' });
        }
        if (user.isVerified === false) {
            return res.status(202).json({ message: 'Please Verify Your Email First' });
        }

        // Check if the password matches using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password');
            return res.status(202).json({ message: 'Incorrect password' });
        }

        // Both email and password are correct
        res.status(200).json({ message: 'Login successful', data: user });
        console.log('User logged in:', user);
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
});

//API to add a new class
app.post('/addClass', async (req, res) => {
    const { classname, desc } = req.body;

    try {
        // Validate request data
        if (!classname || !desc) {
            return res.status(400).json({ message: 'Classname and description are required' });
        }

        // Create a new class document
        const newClass = new Class({ classname, desc });

        // Save the document to MongoDB
        const savedClass = await newClass.save();

        console.log('Class saved:', savedClass);
        res.status(201).json({
            message: 'Class created successfully',
            data: savedClass,
        });
    } catch (err) {
        console.error('Error creating class:', err);
        res.status(500).json({ message: 'Error creating class', error: err.message });
    }
});




// API to fetch all classes
app.post('/fetchClass', async (req, res) => {
    console.log('Fetching all classes...');
    try {
        // Fetch all class documents from the database
        const classes = await Class.find();

        console.log('Fetched classes:', classes);
        res.status(200).json(classes); // Send the classes as a JSON response
    } catch (err) {
        console.error('Error fetching classes:', err);
        res.status(500).json({ message: 'Error fetching classes', error: err.message });
    }
});
app.post('/createPrivateClassroom', async (req, res) => {
    const { userid, useremail, classroomid, privateclassroomname, privateclassroompassword } = req.body;
    console.log(req.body);
    try {
        // Create a new PrivateClassroom document
        const existingPrivateClassroom = await PrivateClassroom.findOne({
            privateclassroomname
        })

        if (existingPrivateClassroom) {
            return res.status(400).json({ message: 'Private classroom already exists' });
        }

        const newPrivateClassroom = new PrivateClassroom({
            userid,
            useremail,
            classroomid,
            privateclassroomname,
            privateclassroompassword,
        });

        //Save the document to MongoDB
        await newPrivateClassroom.save();

        console.log('Private classroom saved:', newPrivateClassroom);
        res.status(201).json({ message: 'Private classroom created successfully', data: newPrivateClassroom });
    } catch (err) {
        console.error('Error saving private classroom:', err);
        res.status(500).json({ message: 'Error creating private classroom', error: err.message });
    }
});
// API to fetch all private classrooms for a given classroomid
app.post('/getPrivateClassrooms', async (req, res) => {
    const { classroomid, userid } = req.body;
    console.log('Classroom ID:', classroomid);
    console.log('User ID:', userid);

    try {
        // Find all private classrooms with the given classroomid where userid does not match
        const privateClassrooms = await PrivateClassroom.find({
            classroomid,
            userid: { $ne: userid }, // Filter where userid is not equal to the provided userid
        });

        if (privateClassrooms.length === 0) {
            return res
                .status(404)
                .json({ message: 'No private classrooms found for the given classroom ID and user ID' });
        }

        console.log('Fetched private classrooms:', privateClassrooms);
        res.status(200).json({ message: 'Private classrooms fetched successfully', data: privateClassrooms });
    } catch (err) {
        console.error('Error fetching private classrooms:', err);
        res.status(500).json({ message: 'Error fetching private classrooms', error: err.message });
    }
});

app.post('/getUserPrivateClassrooms', async (req, res) => {
    const { classroomid, userid } = req.body;

    console.log('Classroom ID:', classroomid);
    console.log('User ID:', userid);

    try {
        // Find private classrooms where both classroomid and userid match
        const privateClassrooms = await PrivateClassroom.find({
            classroomid,
            userid,
        });

        if (privateClassrooms.length === 0) {
            return res
                .status(404)
                .json({ message: 'No private classrooms found for the given classroom ID and user ID' });
        }

        console.log('Fetched private classrooms:', privateClassrooms);
        res.status(200).json({
            message: 'Private classrooms fetched successfully',
            data: privateClassrooms,
        });
    } catch (err) {
        console.error('Error fetching private classrooms:', err);
        res.status(500).json({
            message: 'Error fetching private classrooms',
            error: err.message,
        });
    }
});
async function RenerateAIResponse2(prompt, privateclassroomid) {
    var aiPrompt = prompt.replace('@AI-Gen', '').trim();
    aiPrompt = aiPrompt + " Keep your answer under 50 words"


    const response = await model.generateContent(aiPrompt);

    // Extract the message text from the response
    let message = "Unable to generate response.";

    const response2 = await response.response;
    message = response2.text();

    const email = "AI GENERATED RESPONSE";
    const newChat = new Chat({
        email,
        privateclassroomid,
        message, // Save the extracted message
    });

    await newChat.save();
}
async function RenerateAIResponse(prompt) {
    let aiPrompt = prompt.replace('@AI-Gen', '').trim();
    aiPrompt += " Keep your answer under 50 words";

    const response = await model.generateContent(aiPrompt);
    const response2 = await response.response;
    let message = "Unable to generate response.";
    message = response2.text();

    // Just return the generated message text
    return message;
}
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    path: '/socket.io'
});

const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a private classroom room
    socket.on('joinRoom', async (privateclassroomid) => {
        socket.join(privateclassroomid);
        console.log(`User joined room: ${privateclassroomid}`);

        // Optional: Send existing chat history to the user
        try {
            const chats = await Chat.find({ privateclassroomid }).sort({ createdAt: 1 }); // Sort by oldest first
            socket.emit('chatHistory', chats); // Send chat history to the client
        } catch (error) {
            console.error('Error fetching chat history:', error);
            socket.emit('error', { message: 'Error fetching chat history', error: error.message });
        }
    });

    // Listen for new messages
    // In your sendMessage event:
    socket.on('sendMessage', async ({ email, privateclassroomid, message }) => {
        if (!email || !privateclassroomid || !message) {
            return socket.emit('error', { message: 'All fields are required' });
        }

        try {
            // Save user's message first
            const newChat = new Chat({ email, privateclassroomid, message });
            await newChat.save();
            chatNamespace.to(privateclassroomid).emit('newMessage', newChat);

            // If the message includes @AI-Gen, generate AI response
            if (message.includes('@AI-Gen')) {
                // Emit placeholder to show that we are working on the response
                const placeholderChat = {
                    email: 'AI-Gen',
                    privateclassroomid,
                    message: 'Generating response...',
                };
                chatNamespace.to(privateclassroomid).emit('newMessage', placeholderChat);

                // Wait for AI response
                const aiResponseText = await RenerateAIResponse(message);

                // Save AI response to DB
                const aiChat = new Chat({
                    email: 'AI-Gen',
                    privateclassroomid,
                    message: aiResponseText,
                });
                await aiChat.save();

                // Emit the final AI-generated message
                chatNamespace.to(privateclassroomid).emit('newMessage', aiChat);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Error saving message', error: error.message });
        }
    });


    // Disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.post('/sendMessage', async (req, res) => {
    const { email, privateclassroomid, message } = req.body;

    if (!email || !privateclassroomid || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new chat document
        const newChat = new Chat({
            email,
            privateclassroomid,
            message,
        });

        // Save the document to the database
        await newChat.save();
        if (message.includes('@AI-Gen')) {
            await RenerateAIResponse(message, privateclassroomid);

        }
        //console.log('Message saved:', newChat);
        res.status(201).json({
            message: 'Message sent successfully',
            chatId: newChat._id,
        });
    } catch (err) {
        console.error('Error saving chat message:', err);
        res.status(500).json({
            message: 'Error saving chat message',
            error: err.message,
        });
    }
});

app.post('/fetchChats', async (req, res) => {
    const { privateclassroomid } = req.body;

    try {

        // Fetch chats with the given privateclassroomid
        const chats = await Chat.find({ privateclassroomid });

        if (chats.length === 0) {
            return res.status(404).json({ message: "No chats found for the given PrivateClassroomID" });
        }

        res.status(200).json({
            message: "Chats fetched successfully",
            data: chats,
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({
            message: "Error fetching chats",
            error: error.message,
        });
    }
});
app.post('/createAnnouncement', async (req, res) => {
    const { privateclassroomid, announcementdata, email } = req.body;

    try {
        // Validate required fields
        if (!privateclassroomid || !announcementdata || !email) {
            return res.status(400).json({ message: "All fields are required: privateclassroomid, announcementdata, email" });
        }

        // Create a new announcement document
        const newAnnouncement = new Announcement({
            privateclassroomid,
            announcementdata,
            email,
        });

        // Save the announcement to the database
        await newAnnouncement.save();

        //console.log("Announcement created:", newAnnouncement);
        res.status(201).json({ message: "Announcement created successfully", data: newAnnouncement });
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Error creating announcement", error: error.message });
    }
});
app.post('/getAnnouncements', async (req, res) => {
    const { privateclassroomid } = req.body;

    try {
        // Validate input
        if (!privateclassroomid) {
            return res.status(400).json({ message: "Private Classroom ID is required" });
        }

        // Find all announcements with the given privateclassroomid
        const announcements = await Announcement.find({ privateclassroomid });

        if (announcements.length === 0) {
            return res.status(404).json({ message: "No announcements found for the given Private Classroom ID" });
        }

        //console.log("Fetched announcements:", announcements);
        res.status(200).json({ message: "Announcements fetched successfully", data: announcements });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Error fetching announcements", error: error.message });
    }
});
app.post('/createAssignment', async (req, res) => {
    const { privateclassroomid, email, title, desc, duedate } = req.body;

    try {
        // Validate input
        if (!privateclassroomid || !email || !title || !desc || !duedate) {
            return res.status(400).json({ message: "All fields are required: privateclassroomid, email, title, desc, duedate" });
        }

        // Create a new assignment document
        const newAssignment = new Assignment({
            privateclassroomid,
            email,
            title,
            desc,
            duedate,
        });

        // Save the assignment to the database
        await newAssignment.save();

        //console.log("Assignment created:", newAssignment);
        res.status(201).json({ message: "Assignment created successfully", data: newAssignment });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
});
app.post('/getAssignments', async (req, res) => {
    const { privateclassroomid } = req.body;

    try {
        // Validate input
        if (!privateclassroomid) {
            return res.status(400).json({ message: "Private Classroom ID is required" });
        }

        // Find all assignments with the given privateclassroomid
        const assignments = await Assignment.find({ privateclassroomid });

        if (assignments.length === 0) {
            return res.status(404).json({ message: "No assignments found for the given Private Classroom ID" });
        }

        //console.log("Fetched assignments:", assignments);
        res.status(200).json({ message: "Assignments fetched successfully", data: assignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Error fetching assignments", error: error.message });
    }
});

app.post('/submitAssignment', async (req, res) => {
    const { assignmentid, base64string, email, description, filetype } = req.body;

    // Check for required fields
    if (!base64string || !email || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Create a new assignment submission document
        const newSubmission = new AssignmentSubmission({
            assignmentid,
            email,
            description,
            base64string,  // Store the base64 string as normal text
            filetype,      // Store the filetype (e.g., 'image/jpeg', 'application/pdf', etc.)
        });

        // Save the document to MongoDB
        await newSubmission.save();

        //console.log('Assignment submitted:', { assignmentid, email });
        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (err) {
        console.error('Error saving assignment submission:', err);
        res.status(500).json({ message: 'Error saving assignment', error: err.message });
    }
});
app.post('/getSubmissions', async (req, res) => {
    const { assignmentid } = req.body;

    if (!assignmentid) {
        return res.status(400).json({ message: 'Assignment ID is required' });
    }

    try {
        // Find all submissions that match the assignmentid
        const submissions = await AssignmentSubmission.find({ assignmentid });

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this assignment' });
        }

        // Send the found submissions as a JSON response
        res.status(200).json({
            message: 'Submissions fetched successfully',
            data: submissions
        });
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ message: 'Error fetching submissions', error: err.message });
    }
});

app.delete('/deleteAssignmentSubmission', async (req, res) => {
    const { assignmentSubmissionId } = req.body;  // Expecting the ID to be sent in the request body

    if (!assignmentSubmissionId) {
        return res.status(400).json({ message: 'Assignment Submission ID is required' });
    }

    try {
        // Find and remove the document by ID
        const deletedSubmission = await AssignmentSubmission.findByIdAndDelete(assignmentSubmissionId);

        if (!deletedSubmission) {
            return res.status(404).json({ message: 'Assignment submission not found' });
        }

        //console.log('Deleted assignment submission:', deletedSubmission);
        res.status(200).json({ message: 'Assignment submission deleted successfully', data: deletedSubmission });
    } catch (err) {
        console.error('Error deleting assignment submission:', err);
        res.status(500).json({ message: 'Error deleting assignment submission', error: err.message });
    }
});
app.put('/updateUserDetails', async (req, res) => {
    const { email, fullname, dob, password } = req.body;

    // Validate request data
    if (!email) {
        return res.status(400).json({ message: 'Email is required to update user details' });
    }

    try {
        // Create an object with the fields to update
        const updateFields = {};

        if (fullname) updateFields.fullname = fullname;
        if (dob) updateFields.dob = dob;

        // Hash the password if it's provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        // Find the user by email and update the details
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Query to find the user by email
            { $set: updateFields }, // Fields to update
            { new: true, runValidators: true } // Return the updated document and validate data
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found with the given email' });
        }

        console.log('Updated user details:', updatedUser);
        res.status(200).json({ message: 'User details updated successfully', data: updatedUser });
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).json({ message: 'Error updating user details', error: err.message });
    }
});
// app.post('/notes', upload.single('file'), async (req, res) => {
//     console.log('Request body:', req.body);
//     console.log('Uploaded file:', req.file);
//     try {
//         const { title, content } = req.body;
//         const newNote = new Note({
//             title,
//             content,
//             fileUrl: req.file ? req.file.path : null,
//             fileType: req.file ? req.file.mimetype : null,
//             classroomid: req.body.classroomid,
//             email: req.body.email,
//         });
//         await newNote.save();
//         res.status(201).json({ message: 'Note created successfully', note: newNote });
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to create note', details: err.message });
//     }
// });


// const multer = require("multer");

// Multer setup to handle file uploads
const u = multer({ storage: multer.memoryStorage() });

// Function to check content appropriateness using Gemini API
async function checkContentAppropriateness(title, content) {
    try {
        // Educational content filter that blocks scams and inappropriate content
        const prompt = `You are reviewing content for an educational platform. Allow educational content but block scams and inappropriate material.

Title: "${title}"
Content: "${content}"

Respond with ONLY one word:
- "APPROPRIATE" for legitimate educational content: study materials, course notes, assignments, academic topics, research, textbooks, lecture notes, etc.

- "INAPPROPRIATE" for harmful content including:
  * SCAMS: "You've won", "congratulations you've been selected", "claim your prize", "click this link", "limited time offer", "act now", "100% guaranteed", "once in a lifetime opportunity", fake giveaways, suspicious links
  * SPAM: Promotional content, advertisements, marketing schemes, MLM content
  * EXPLICIT: Adult/sexual content, graphic violence
  * HATE SPEECH: Content targeting individuals or groups
  * FRAUD: Fake certificates, cheating services, academic dishonesty

Educational content should be APPROPRIATE, but be strict about scams, spam, and promotional content.

Your response must be exactly one word: APPROPRIATE or INAPPROPRIATE`;

        const response = await model.generateContent(prompt);
        const result = response.response.text().trim().toUpperCase();

        console.log('🔍 Content check result:', result);
        console.log('📝 Title:', title);
        console.log('📄 Content preview:', content ? content.substring(0, 100) + '...' : 'No content');

        return {
            isAppropriate: result === 'APPROPRIATE',
            result: result
        };
    } catch (error) {
        console.error('❌ Error checking content appropriateness:', error);
        // If Gemini API fails, allow content but log the error
        console.log('⚠️ Gemini API unavailable, allowing content upload');
        return {
            isAppropriate: true,
            result: 'API_ERROR_ALLOWED'
        };
    }
}

app.post('/notes', u.single('file'), async (req, res) => {
    try {
        const { title, content, classroomid, email } = req.body;
        const file = req.file;

        // Validate required fields
        if (!title || !classroomid || !email) {
            return res.status(400).json({ message: 'Title, classroom ID, and email are required' });
        }

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB' });
        }

        // Only allow PDF files
        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                message: 'Only PDF files are allowed for note uploads.'
            });
        }

        // Extract text from PDF files for content checking
        let fileTextContent = '';
        if (file.mimetype === 'application/pdf') {
            try {
                console.log('📄 Extracting text from PDF for content analysis...');
                const pdfParse = require('pdf-parse');
                const pdfData = await pdfParse(file.buffer);
                fileTextContent = pdfData.text;
                console.log('✅ PDF text extracted:', fileTextContent.substring(0, 200) + '...');
            } catch (pdfError) {
                console.log('⚠️ Could not extract PDF text, checking title/description only:', pdfError.message);
                fileTextContent = '';
            }
        } else if (file.mimetype === 'text/plain') {
            fileTextContent = file.buffer.toString('utf-8');
            console.log('✅ Text file content extracted');
        }

        // Check content appropriateness using Gemini API (can be disabled for testing)
        const ENABLE_CONTENT_FILTER = process.env.ENABLE_CONTENT_FILTER !== 'false';

        if (ENABLE_CONTENT_FILTER) {
            console.log('🔍 Checking content appropriateness...');
            // Combine title, description, and file content for analysis
            const fullContent = `${content || ''}\n\nFile content:\n${fileTextContent}`.trim();
            const contentCheck = await checkContentAppropriateness(title, fullContent);

            if (!contentCheck.isAppropriate) {
                console.log('❌ Content flagged as inappropriate:', contentCheck.result);
                return res.status(400).json({
                    message: 'Content flagged as inappropriate for educational use.',
                    reason: contentCheck.result,
                    details: 'Please review your content and ensure it meets educational standards before resubmitting.'
                });
            }
        } else {
            console.log('⚠️ Content filter disabled for testing');
        }

        console.log('✅ Content approved for educational use');

        // Upload file to Dropbox
        console.log('📤 Uploading file to Dropbox...');
        const fileName = `note_${Date.now()}_${file.originalname}`;
        const fileUrl = await uploadToDropbox(file.buffer, fileName);
        console.log('✅ File uploaded to Dropbox successfully:', fileUrl);

        // Save note details to database
        const newNote = new Note({
            title,
            content: content || '',
            fileUrl,
            fileType: file.mimetype,
            classroomid,
            email,
        });

        console.log('💾 Saving note to MongoDB...');
        await newNote.save();
        console.log('✅ Note saved to MongoDB successfully:', newNote._id);

        // Send success response
        res.status(201).json({
            message: 'Note uploaded successfully! Content approved for educational use.',
            note: newNote,
            status: 'APPROVED'
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            message: 'File upload failed',
            error: error.message,
            details: 'Please check your file and try again'
        });
    }
});

// Test endpoint for notes upload debugging
app.post('/test-notes-upload', async (req, res) => {
    try {
        // Test Backblaze B2 connection
        await b2.authorize();
        console.log('✅ Backblaze B2 authorization successful');

        // Test Gemini API
        const testResponse = await model.generateContent('Test message');
        console.log('✅ Gemini API connection successful');

        res.status(200).json({
            message: 'All services are working correctly',
            backblaze: 'Connected',
            gemini: 'Connected'
        });
    } catch (error) {
        console.error('Service test failed:', error);
        res.status(500).json({
            message: 'Service test failed',
            error: error.message
        });
    }
});








// app.post('/getnotes', async (req, res) => {
//     try {
//         const notes = await Note.find({ classroomid: req.body.classroomid });
//         res.status(200).json(notes);
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to fetch notes' });
//     }
// });


app.post('/getnotes', async (req, res) => {
    try {
        const notes = await Note.find({ classroomid: req.body.classroomid });

        if (!notes.length) {
            return res.status(404).json({ message: 'No notes found' });
        }

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
    }
});

// Serve files with proper headers (Dropbox proxy endpoint)
app.get('/serve-file/:noteId', async (req, res) => {
    try {
        console.log('🔍 Serving file for note ID:', req.params.noteId);

        const note = await Note.findById(req.params.noteId);
        if (!note || !note.fileUrl) {
            console.log('❌ Note or file URL not found');
            return res.status(404).json({ message: 'File not found' });
        }

        console.log('📁 Found note:', note.title);
        console.log('🔗 Dropbox URL:', note.fileUrl);

        // Check if this is a download request
        const isDownload = req.query.download === 'true';
        console.log(isDownload ? '⬇️ Download request' : '👁️ View request');

        // Fetch the file from Dropbox with proper headers
        const response = await axios.get(note.fileUrl, {
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('✅ Successfully fetched file from Dropbox');

        // Set headers based on whether it's download or view
        const headers = {
            'Content-Type': 'application/pdf',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        };

        if (isDownload) {
            // Force download
            headers['Content-Disposition'] = `attachment; filename="${note.title}.pdf"`;
        } else {
            // Open in browser (view)
            headers['Content-Disposition'] = `inline; filename="${note.title}.pdf"`;
        }

        res.set(headers);

        // Pipe the file stream to response
        response.data.pipe(res);

    } catch (error) {
        console.error('❌ Error serving file from Dropbox:', error.message);

        // For Dropbox, we can also try redirecting to the direct URL
        try {
            const note = await Note.findById(req.params.noteId);
            if (note && note.fileUrl) {
                console.log('🔄 Redirecting to direct Dropbox URL...');
                return res.redirect(note.fileUrl);
            }
        } catch (redirectError) {
            console.error('❌ Redirect also failed:', redirectError.message);
        }

        res.status(500).json({ message: 'Error serving file', error: error.message });
    }
});

// Test endpoint to verify backend is working
app.get('/test-serve', (req, res) => {
    res.json({
        message: 'Backend proxy endpoint is working!',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Test endpoint to verify Dropbox connection
app.get('/test-dropbox', async (req, res) => {
    try {
        // Test Dropbox connection by getting account info
        const accountInfo = await dbx.usersGetCurrentAccount();
        res.json({
            message: 'Dropbox API connection successful!',
            account: accountInfo.result.name.display_name,
            email: accountInfo.result.email,
            status: 'OK'
        });
    } catch (error) {
        console.error('❌ Dropbox connection test failed:', error);
        res.status(500).json({
            message: 'Dropbox API connection failed',
            error: error.message,
            status: 'ERROR'
        });
    }
});





const videoNamespace = io.of('/video');

videoNamespace.on('connection', (socket) => {
    console.log('User connected to /video:', socket.id);

    socket.on('create-room', async ({ userId, roomName, newMeetType, newMeetDate, newMeetTime, classroomId }) => {
        const newRoom = new Rooms({
            roomName,
            host: userId,
            meetType: newMeetType,
            meetDate: newMeetDate,
            meetTime: newMeetTime,
            classroomId,
            participants: [],
            currentParticipants: []
        });
        const room = await newRoom.save();
        socket.emit("room-created", { roomId: room._id, meetType: newMeetType });
    });

    socket.on('user-code-join', async ({ roomId }) => {
        const room = await Rooms.findOne({ _id: roomId });
        if (room) socket.emit("room-exists", { roomId });
        else socket.emit("room-not-exist");
    });

    socket.on('request-to-join-room', async ({ roomId, userId }) => {
        const room = await Rooms.findOne({ _id: roomId });
        if (room.host === userId) {
            socket.emit('join-room', { roomId, userId });
        } else {
            socket.broadcast.to(roomId).emit('user-requested-to-join', { participantId: userId, hostId: room.host });
        }
    });

    socket.on('join-room', async ({ roomId, userId }) => {
        await Rooms.updateOne({ _id: roomId }, { $addToSet: { participants: userId } });
        await Rooms.updateOne({ _id: roomId }, { $addToSet: { currentParticipants: userId } });
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-joined", { userId });
    });

    socket.on("user-left-room", async ({ userId, roomId }) => {
        await Rooms.updateOne({ _id: roomId }, { $pull: { currentParticipants: userId } });
        socket.leave(roomId);
    });

    socket.on('user-disconnected', async ({ userId, roomId }) => {
        console.log(`User: ${userId} left room ${roomId}`);
    });

    socket.on("new-chat", async ({ msg, roomId }) => {
        socket.broadcast.emit("new-chat-arrived", { msg, room: roomId });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from /video:', socket.id);
    });

    socket.on("get-participants", async ({ roomId }) => {
        console.log("📢 Fetching Participants for Room:", roomId);
        const room = await Rooms.findOne({ _id: roomId });

        if (!room) {
            console.log("❌ Room not found!");
            return;
        }

        // Convert to regular JavaScript object to avoid proxy issues
        const roomData = room.toObject();

        console.log("🏠 Room Name:", roomData.roomName);
        console.log("👥 Participants:", roomData.currentParticipants);

        const roomName = roomData.roomName;
        const participants = roomData.currentParticipants || [];
        const usernames = {};

        // Ensure we have participants before querying
        if (participants.length > 0) {
            try {
                // Use fullname instead of username based on your schema
                const users = await User.find(
                    { _id: { $in: participants } },
                    { _id: 1, fullname: 1 }
                ).exec();

                users.forEach(user => {
                    const { _id, fullname } = user;
                    usernames[_id.valueOf()] = fullname; // Use fullname instead of username
                });

                console.log("✅ Found users:", users.length);
            } catch (err) {
                console.error("❌ Error fetching users:", err);
            }
        } else {
            console.log("⚠️ No participants in room");
        }

        console.log("✅ Sending Participants List:", usernames);
        socket.emit("participants-list", { usernames, roomName });
    });

});



// Deepgram API endpoint
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";


const upload = multer({ storage: multer.memoryStorage() });

// ✅ **Upload file directly to Dropbox**
async function uploadToDropbox(buffer, fileName) {
    try {
        console.log('📤 Uploading file to Dropbox:', fileName);

        // Upload file to Dropbox app folder
        const uploadResponse = await dbx.filesUpload({
            path: '/' + fileName,
            contents: buffer,
            mode: 'overwrite',
            autorename: true
        });

        console.log('✅ File uploaded to Dropbox successfully:', uploadResponse.result.name);

        // Create a shared link for the file
        const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: uploadResponse.result.path_lower,
            settings: {
                requested_visibility: 'public',
                audience: 'public',
                access: 'viewer'
            }
        });

        // Convert Dropbox preview link to direct download link
        let directUrl = sharedLinkResponse.result.url;
        // Replace ?dl=0 with ?dl=1 for direct download, or replace www.dropbox.com with dl.dropboxusercontent.com
        directUrl = directUrl.replace('?dl=0', '?dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');

        console.log('🔗 Dropbox public URL created:', directUrl);

        return directUrl;

    } catch (error) {
        console.error('❌ Dropbox Upload Error:', error);
        throw error;
    }
}

// ✅ **Handle Audio Upload & Direct Transcription**
app.post("/uploadAudio", upload.single("audio"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
        const fileName = `audio_${Date.now()}.webm`;

        // ✅ **Upload audio directly to Dropbox**
        const audioUrl = await uploadToDropbox(req.file.buffer, fileName);

        // ✅ **Send to Deepgram for Transcription**
        const response = await axios.post("https://api.deepgram.com/v1/listen", req.file.buffer, {
            headers: { Authorization: `Token ${DEEPGRAM_API_KEY}`, "Content-Type": "audio/webm" },
            params: { punctuate: true, model: "nova", language: "en" },
        });

        const transcriptionText =
            response.data.results?.channels[0]?.alternatives[0]?.transcript || "No transcription available";

        // ✅ **Upload transcription file directly**
        const transcriptionFileName = `transcription_${Date.now()}.txt`;
        const transcriptionUrl = await uploadToDropbox(Buffer.from(transcriptionText, "utf8"), transcriptionFileName);

        // ✅ **Generate Summary using Gemini API**
        let summarizedTranscriptionUrl = null;
        try {
            console.log("Generating summary using Gemini API...");

            // Create a prompt for summarization
            const summaryPrompt = `Please provide a concise summary of the following meeting transcript. Focus on key points, decisions made, and action items:

${transcriptionText}

Summary:`;

            const summaryResponse = await model.generateContent(summaryPrompt);
            const summaryText = summaryResponse.response.text();

            // Upload the summary to Dropbox
            const summaryFileName = `summary_${Date.now()}_${req.body.roomId || "default"}.txt`;
            summarizedTranscriptionUrl = await uploadToDropbox(Buffer.from(summaryText, "utf8"), summaryFileName);

            console.log("Summary generated and uploaded successfully");
        } catch (summaryError) {
            console.error("Summary generation error:", summaryError.message);
            // Continue even if summarization fails
        }

        // ✅ **Save in MongoDB with summarized transcription if available**
        const newMeeting = new Meeting({
            roomId: req.body.roomId,
            audioUrl,
            transcriptionUrl,
            processedTranscriptionUrl: summarizedTranscriptionUrl
        });
        await newMeeting.save();

        // ✅ **Get the classroom ID from the corresponding room**
        const roomId = req.body.roomId;
        if (roomId && summarizedTranscriptionUrl) {
            try {
                // Find the room to get the classroomId
                const room = await Rooms.findOne({ _id: roomId });

                if (room && room.classroomId) {
                    // Create an announcement with the transcription link
                    const announcement = new Announcement({
                        privateclassroomid: room.classroomId,
                        announcementdata: `📝 Meeting transcription available: "${summarizedTranscriptionUrl}" `,
                        email: "system@edunetwork.com" // You might want to replace this with actual user email if available
                    });

                    await announcement.save();
                    console.log("📢 Transcription announcement posted to classroom!");
                }
            } catch (announcementError) {
                console.error("❌ Error posting transcription announcement:", announcementError);
            }
        }

        res.json({
            message: "Success",
            transcription: transcriptionText,
            transcriptionUrl,
            audioUrl,
            processedTranscriptionUrl: summarizedTranscriptionUrl
        });
    } catch (error) {
        console.error("❌ Transcription Error:", error);
        res.status(500).json({ message: "Transcription failed", error: error.message });
    }
});
server.listen(SOCKET_PORT, () => {
    console.log(`Socket Running on ${SOCKET_PORT}`);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});