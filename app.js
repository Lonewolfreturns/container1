const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8080;
const DATA_DIR = '/akash_PV_dir'
const CONTAINER2_URL = 'http://container2-service:8081/calculate';


app.use(express.json());
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) 
    {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(DATA_DIR, file);

    try 
    {
        fs.writeFileSync(filePath, data);
        res.json({ file, message: 'Success.' });
    }
    catch (err) 
    {
        console.error('Error occurred while storing the file:', err.message);
        res.status(500).json({ file, error: 'Error while storing the file to the storage.' });
    }
});

// Endpoint to handle calculation requests
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    // Validate the input
    if (!file) 
    {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(DATA_DIR, file);

    // Check if the file exists
    if (!fs.existsSync(filePath)) 
    {
        return res.status(404).json({ file, error: 'File not found.' });
    }

    try 
    {
        // Send the request to container2
        const response = await axios.post(CONTAINER2_URL, { file: filePath, product });
        return res.json(response.data);
    }
    catch (error) 
    {
        console.error('Error occurred while making request to container2:', error.message);

        // Extract error information
        const status = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.data : 'Internal server error';

        return res.status(status).json(errorMessage);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend service running on port ${PORT}`);
});
