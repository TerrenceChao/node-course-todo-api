const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');

const todos = [{
        _id: new ObjectID(),
        text: "First test todo."
    }, {
        _id: new ObjectID(),
        text: "Second test todo."
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
        var text = "this is test todo";

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                
                Todo.find().then((items) => {
                    expect(items.length).toBe(3);
                    expect(items[2].text).toBe(text);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .send()
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            }, (e) => done(e))
            .end(done);
    });
});

describe('GET /todos:id', () => {

    it('should return todo doc', (done) => {
        var validId = todos[0]._id;

        request(app)
        .get(`/todos/${validId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(validId.toHexString());
            expect(res.body.todo).toInclude(todos[0]);
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for invalid id', (done) => {
        request(app)
            .get('/todos/banana456')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos:id', () => {

});