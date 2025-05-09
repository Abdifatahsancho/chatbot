const express = require('express');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk');
const multer = require('multer');
const fs = require('fs');
const util = require('util');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// API Key - Directly defined for testing
const GROQ_API_KEY = "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";

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Helper function to extract text from files
async function extractTextFromFile(file) {
  const fileType = path.extname(file.originalname).toLowerCase();
  
  // Process different file types
  try {
    if (fileType === '.pdf') {
      // Parse PDF files
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      
      // Return the first 2000 characters to avoid overwhelming the AI
      const truncatedText = data.text.substring(0, 2000);
      return `[PDF Analysis] Name: ${file.originalname}, Pages: ${data.numpages}\n\nContent: ${truncatedText}${data.text.length > 2000 ? '... (content truncated)' : ''}`;
    } 
    else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileType)) {
      // Image files - just return basic info since we don't have OCR here
      return `[Image Analysis] Name: ${file.originalname}, Size: ${(file.size / 1024).toFixed(2)} KB`;
    }
    else if (['.txt', '.md'].includes(fileType)) {
      // Text files
      const data = fs.readFileSync(file.path, 'utf8');
      const truncatedText = data.substring(0, 2000);
      return `[Text File] Name: ${file.originalname}\n\nContent: ${truncatedText}${data.length > 2000 ? '... (content truncated)' : ''}`;
    }
    else if (['.doc', '.docx'].includes(fileType)) {
      // Word documents - would need mammoth.js in a real app
      return `[Document Analysis] Name: ${file.originalname}, Size: ${(file.size / 1024).toFixed(2)} KB. Note: detailed document parsing would be available in the full version.`;
    }
    else {
      // Other file types
      return `[File Analysis] Name: ${file.originalname}, Size: ${(file.size / 1024).toFixed(2)} KB, Type: ${fileType}`;
    }
  } catch (error) {
    console.error(`Error processing file ${file.originalname}:`, error);
    return `[File Analysis Error] There was an issue processing the file ${file.originalname}. Error: ${error.message}`;
  }
}

// Chatbot endpoint with file upload support
app.post('/api/chat', upload.single('file'), async (req, res, next) => {
  try {
    let message = req.body.message || '';
    let fileInfo = '';
    
    // If there's a file uploaded, process it
    if (req.file) {
      fileInfo = await extractTextFromFile(req.file);
    }
    
    if (!message && !req.file) {
      return res.status(400).json({ error: 'Message or file is required' });
    }

    // Prepare a prompt based on whether there's a file or not
    let promptContent = message;
    
    if (req.file) {
      if (message) {
        promptContent = `The user sent a message: "${message}" along with a file. ${fileInfo}`;
      } else {
        promptContent = `The user uploaded a file without a message. Please analyze this file: ${fileInfo}`;
      }
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Sancho's bot, a highly intelligent and helpful AI assistant designed to support a university student across all areas of their academic and technical life. Your primary user is a student who is studying computer science and taking a range of university-level courses including coding (Python, JavaScript, C++, etc.), mathematics (including discrete math, linear algebra, and calculus), and general academic subjects (e.g., history, literature, research writing).

You must behave as a multi-functional educational assistant, combining the roles of:

💻 Coding tutor and debugger
📚 Study planner and exam coach
🧠 Research and essay helper
⚙️ Software development assistant
📝 Note summarizer and explainer
🧪 Math problem solver and explainer
📊 Project assistant (e.g., managing databases, APIs, and system architecture)
🗂️ Organizer for assignments and academic deadlines

When analyzing files:
1. For PDFs and documents: Provide a concise summary, extract key concepts, and offer to create study materials like flashcards or quizlets
2. For images: Describe what you see and provide relevant academic context
3. For code files: Analyze the code, explain what it does, and suggest improvements
4. For text files: Summarize the content, identify key points, and suggest study strategies

When asked to create study materials:
1. Create concise, effective flashcards with questions on one side and answers on the other
2. Format quizlets with clear questions and multiple-choice answers
3. Provide concept maps showing relationships between key ideas
4. Offer memory aids, mnemonics, and study techniques specific to the subject

🧑‍🎓 User Profile:
Level: University student in CS named Sancho
Skills: Beginner to intermediate in programming, strong interest in backend development
Needs: Task planning, code debugging, assignment help, study explanations, organizing study materials, testing APIs`
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Clean up uploaded file after processing
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({ 
      reply: completion.choices[0].message.content 
    });
  } catch (error) {
    // Clean up file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConfigured: true
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Specific API errors
  if (err.name === 'APIError') {
    return res.status(500).json({ 
      error: 'API error',
      message: err.message
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
=======================================================
🤖 Sancho's Bot server is running on port ${PORT} 🚀
=======================================================
  
Access the chatbot at: http://localhost:${PORT}
  
Need help? Run "npm run setup" to configure your environment
  `);
}); 