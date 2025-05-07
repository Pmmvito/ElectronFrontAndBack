const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const usuarios = require('./routes/rotaUsuario');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/usuarios', usuarios);

sequelize.sync().then(() => {
  app.listen(3001, () => console.log('API no ar em http://localhost:3001'));
});