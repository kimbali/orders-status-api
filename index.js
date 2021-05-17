/**
 * require: no es ecma script modules, es comun js // http para crear request, crear un servidor, es un modulo
 * el callback se va a ejecutar cada vez que le llegue una resquest
 * a createServer se le pasa un callback // que es? una funcion que se ejecuta cuando ocurre algo
 * response tiene varios metodos que puedes ejecutar // en este le escriviremos una cabecera // test plain para saber que tipo de datos estas devolviendo
 * Content-Type: Tipo de datos que devolvemos: hay millones de tipos. Nosotros queremos devolver json -> application/json
 * Hay que usar JSON.stringify para que formatee los datos
 *
 * EXPRES para gestionar las rutas
 * el servidor en express es asyncrono, por eso a .listen le pasamos un calbackk, cuando termines de levantarte, devuelve el console.log
 *
 * API REST arquitectura escalable en api, cada recurso tiene un direccion unica a la que dirigirte
 * Lo que diferencia como se trata ese recurso es la accion (GET, PUT, DELETE...)
 * CRUD no es exactamente el mismo patron que REST
 * :id -> algo dinamico
 * en las rqeust siempre van a venir strings, los params
 *
 *
 */

// SIN EXPRESS, todo esto (200, content type, json.stringy...) lo hace de forma automatica por nosotros
// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "Content-Type": "application/json" });
//   response.end(JSON.stringify(checkpoints));
// });

// const checkpoints = require('./moks/checkpoints.json');
// const trakings = require('./moks/trakings.json');
const { logic } = require('./logic');

const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');

const trakings = [];
const checkpoints = [];

fs.createReadStream('./moks/trackings.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => trakings.push(data))
  .on('end', () => {});

fs.createReadStream('./moks/checkpoints.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => checkpoints.push(data))
  .on('end', () => {});


const app = express();
app.use(cors());
app.use(express.json()); // esto es un modulo de expres (body-parser) que lo que hace es que en los POST puedas mandar informacion, la parse i te la devuelve en el body

app.post('/api/orders', (request, response) => {
  const email = request.body.email;

  const ordersFiltered = logic.reduceListByTrakingNum(trakings, email);
  const filteredProps = logic.basicOrderProps(ordersFiltered);

  if (filteredProps) {
    response.status(201).json(filteredProps);
  } else {
    response.status(404).end();
  }
});

app.get('/api/status/:num', (request, response) => {
  const trakingNum = request.params.num;

  const [currentCheckpoint] = checkpoints
    .filter((element) => element.tracking_number === trakingNum)
    .sort(logic.byNewstTime);

  if (currentCheckpoint) {
    response.status(200).json(currentCheckpoint);
  } else {
    response.status(404).end();
  }
});

app.get('/api/orders/:num', (request, response) => {
  const trakingNum = request.params.num;
  const orders = trakings.filter(
    (element) => element.tracking_number === trakingNum
  );
  const articlesList = logic.articlesOrderProps(orders);

  response.status(200).json(articlesList);
});

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found',
  });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Async server running on port ${PORT}`);
});
