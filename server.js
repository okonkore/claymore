const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.end('Welcome to the homepage!');
  } else if (req.url === '/about') {
    res.end('This is the about page!');
  } else {
    res.statusCode = 404;
    res.end('404 Not Found');
  }
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
