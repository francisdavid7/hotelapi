const express = require('express');
const axios = require('axios');
const app = express();

// Replace this with your Foursquare API key
const FOURSQUARE_API_KEY = 'fsq3GB1w/TlaskbikpILtnTSphQ96GlzCuL3jNCXmnGjyfA=';

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Search for hotels using Foursquare Places API
        const searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&categories=19014&limit=10`;
        
        const headers = {
            Authorization: FOURSQUARE_API_KEY,
        };
        
        const searchResponse = await axios.get(searchUrl, { headers });
        const places = searchResponse.data.results;

        // Fetch images for each place
        const results = await Promise.all(
            places.map(async (place) => {
                const photosUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}/photos`;
                const photosResponse = await axios.get(photosUrl, { headers });
                const photos = photosResponse.data;

                return {
                    name: place.name,
                    description: place.location.formatted_address || "No description available",
                    image: photos.length > 0 
                        ? `${photos[0].prefix}original${photos[0].suffix}` 
                        : 'https://example.com/no-image.jpg', // Placeholder if no image
                    rating: "N/A", // Foursquare Places API doesn't provide ratings
                    booking_url: `https://www.google.com/search?q=${encodeURIComponent(place.name)}`
                };
            })
        );

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data from the Foursquare API' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
