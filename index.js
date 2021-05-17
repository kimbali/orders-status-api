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
app.use(express.json()); 

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
