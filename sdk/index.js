const express = require('express');
const app = express();

app.use('/createProduct',);
app.use('/showProduct',)

const port = process.env.PORT || 3000;
app.set('port', port)

const server = http.createServer(app)
server.listen(port, () =>{
    console.log(`connected on ${port}`)
})
