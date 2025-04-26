const hashtagInput = document.getElementById('hashtag-input');
const analyzeButton = document.getElementById('analyze-button');
const resultsContainer = document.getElementById('results-container');

let isLoading = false;

analyzeButton.addEventListener('click', async () => {
    const hashtag = hashtagInput.value.trim();
    if (!hashtag || isLoading) return;

    try {
        isLoading = true;
        analyzeButton.disabled = true;
        resultsContainer.innerHTML = '<div class="loading"></div> <p>Analyzing tweets...</p>';

        const response = await fetch(`http://localhost:3000/api/tweets?hashtag=${encodeURIComponent(hashtag)}`);

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            throw new Error('No tweets found for this hashtag');
        }
        const results = data.data.map(tweet => ({
            text: tweet.text,
            sentiment: analyzeSentiment(tweet.text)
        }));

        displayResults(results);
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        isLoading = false;
        analyzeButton.disabled = false;
    }
});

function analyzeSentiment(text) {
    // Enhanced word lists
    const positiveWords = [
        'good', 'great', 'excellent', 'awesome', 'happy', 'love', 'wonderful',
        'beautiful', 'amazing', 'fantastic', 'perfect', 'best', 'brilliant',
        'outstanding', 'superb', 'positive', 'success', 'win', 'winning'
    ];
    
    const negativeWords = [
        'bad', 'terrible', 'awful', 'poor', 'hate', 'sad', 'angry',
        'worse', 'worst', 'horrible', 'failed', 'failure', 'negative',
        'disappointed', 'disappointing', 'pain', 'painful', 'lose', 'losing'
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount--;
    });

    const sentiment = positiveCount + negativeCount;
    
    return {
        score: sentiment,
        label: sentiment > 0 ? 'Positive' : sentiment < 0 ? 'Negative' : 'Neutral',
        intensity: Math.abs(sentiment)
    };
}

function displayResults(results) {
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="error">No tweets found matching your search.</p>';
        return;
    }

    const resultsHtml = results.map(result => {
        const sentimentClass = result.sentiment.label.toLowerCase();
        const intensityStyle = `opacity: ${Math.min(0.5 + Math.abs(result.sentiment.score) * 0.1, 1)}`;
        
        return `
            <div class="tweet-card ${sentimentClass}" style="${intensityStyle}">
                <p class="tweet-text">${escapeHtml(result.text)}</p>
                <p class="sentiment-score">
                    Sentiment: ${result.sentiment.label} 
                    (Score: ${result.sentiment.score}, Intensity: ${result.sentiment.intensity})
                </p>
            </div>
        `;
    }).join('');

    resultsContainer.innerHTML = resultsHtml;
}

// Helper function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}