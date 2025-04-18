require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai'); // Correct import for OpenAI library

const app = express();

// CORS Setup
app.use(cors({
  origin: '*', // Allow all origins for now, you can change this to a specific domain later
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware
app.use(bodyParser.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in your .env file
});

// API Route
app.post('/api/review-code', async (req, res) => {
  const code = req.body.code;
  
  console.log('Received request to /api/review-code');
  
  if (!code || typeof code !== 'string') {
    console.warn('Invalid or missing code in request');
    return res.status(400).json({ error: 'Invalid or missing code' });
  }

  try {
    console.log('Sending request to OpenAI API');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful code reviewer. Provide brief, constructive feedback."
        },
        {
          role: "user",
          content: `Please review this code:\n\n${code}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('Invalid API response structure:', completion);
      return res.status(500).json({ error: 'Invalid API response' });
    }

    console.log('OpenAI API response received');
    res.json({ review: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

