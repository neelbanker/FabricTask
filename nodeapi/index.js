const invoke = require('./invoke');
const query = require('./query');

const express = require('express');
const app = express();
//const router = express.Router();
app.use(express.json());

app.use('/invoke', invoke.invokeChaincode);
app.use('/query', query.queryChaincode);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));