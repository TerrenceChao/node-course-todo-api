var express = require('express');
var bodyParser = require('body-parser');

var {ObjectID} = require('mongodb');


var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const PORT = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());

//POST update
app.post('/todos', (req, res) => {

    var text = req.body.text;
    if (!text) {
        return res.status(400).send();
    }

    var todo = new Todo({text});

    todo.save().then((doc) => {
        res.send(doc);
        }, (e) => {
        res.status(400).send(e);
    });
});

//GET get all
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }).catch((e) => res.status(400).send(e));
});

//GET get one
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

//DEDLETE delete one
app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        
        res.send({todo});
    })
    .catch((e) => res.status(400).send(e));
});


app.listen(PORT, () => {
    console.log(`Started up at port ${PORT}`);
});

module.exports = {app};
