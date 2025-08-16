require('dotenv').config();
const http = require('http');
const app = require('./index');

// ✅ Pass 'app' to http.createServer so it can handle requests
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

