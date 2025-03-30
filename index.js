const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/users', (req, res) => {
    const users = [
        { id: 1, username: 'admin', role: 'Administrator' }
    ];
    res.json(users);
});

// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`✅ High Peaks Identity Service is running on port ${PORT}`);
});
