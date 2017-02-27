const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

// var msg = "I am terminator 4";
// var hash = SHA256(msg + '123abc').toString();

// console.log('msg:', msg);
// console.log('hash:', hash);

var data = {id: 10, name: 'Terrence'};

var token = jwt.sign(data, '123abc');
var decoded = jwt.verify(token, '123abc');

console.log(token);
console.log('decoded', decoded);
console.log("decoded:id", decoded.id);