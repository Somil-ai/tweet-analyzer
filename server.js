const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// More specific CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET']
}));

app.use(express.static('.'));

app.get('/api/tweets', async (req, res) => {
    try {
        const hashtag = req.query.hashtag;
        if (!hashtag) {
            return res.status(400).json({ error: 'Hashtag parameter is required' });
        }

        if (!process.env.TWITTER_BEARER_TOKEN) {
            return res.status(500).json({ error: 'Twitter API token not configured' });
        }

        const response = await axios.get(
            `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(hashtag)}&max_results=10`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Twitter API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch tweets',
            details: error.response?.data?.errors || error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));