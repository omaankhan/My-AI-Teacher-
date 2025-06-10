// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json()); // JSON बॉडी को पढ़ने के लिए

const API_KEY = process.env.GEMINI_API_KEY; 

if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in environment variables.');
    console.error('Please set your GEMINI_API_KEY as an environment variable (e.g., in Replit secrets).');
    process.exit(1); 
}

const genAI = new GoogleGenerativeAI(API_KEY);

// यह सुनिश्चित करता है कि जब कोई आपके Replit URL के रूट पर जाए, तो index.html दिखे
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// यह आपका API एंडपॉइंट है जो Gemini API को कॉल करेगा
app.post('/ask-teacher', async (req, res) => {
    try {
        const { prompt } = req.body; 

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required in the request body.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt); 
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        if (error.response && error.response.data) {
            console.error('API error details:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to get answer from the teacher. Please check server logs.' });
    }
});

// सर्वर शुरू करें
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('API Key loaded successfully:', !!API_KEY); 
});
