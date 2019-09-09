let product = Buffer.from('\"name\":\"TV\",\"quantity\":4,\"price\":35000,\"owner\":\"tom\"','base64');
var data = JSON.stringify(product);
data = new Buffer(data).toString('base64');

console.log(data);