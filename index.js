const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 8080

const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres', 'postgres', 'secret', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  operatorsAliases: false,
})

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    field: 'name',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
  },
})

// cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', async function(req, res) {
  const data = await User.findAll()
  res.send(data)
})

// cors
io.origins('*:*')

io.on('connection', function(socket) {
  console.log('connection')

  socket.on('open', function() {
    console.log('open')
    console.log(arguments)
  })

  socket.on('message', async function() {
    console.log('message')
    console.log(arguments['0'])
    await sequelize.sync()
    const data = await User.create({
      name: arguments['0'],
    })
    console.log(data.toJSON())
  })

  socket.on('disconnect', function() {
    console.log('disconnect')
  })
})

http.listen(port, function() {
  console.log('listening on *:' + port)
})
