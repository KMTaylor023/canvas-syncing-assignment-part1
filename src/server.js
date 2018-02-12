const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');


const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);

const io = socketio(app);

let value = 0;

// sends out value to all sockets
const updateValue = () => {
  io.sockets.in('room1').emit('value', { value });
};


// handles increment events
const onIncrement = (sock) => {
  const socket = sock;

  socket.on('increment', (data) => {
    const change = data.increment;
    value += change;
  });
};

// handles disconnect events
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

// Sets up the socket message handlers
io.sockets.on('connection', (socket) => {
  console.log('started');

  socket.join('room1');

  onIncrement(socket);
  onDisconnect(socket);

  // update value every 200 milliseconds2
  setInterval(updateValue, 200);
});

console.log('Websocket server started');

