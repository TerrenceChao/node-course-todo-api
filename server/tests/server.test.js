const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

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

    it('should return deleted todo if it is found', (done) => {
        var hexId = todos[0]._id.toHexString();
        
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {

        var hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todo/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        
        request(app)
            .delete('/todo/whatfor')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos:id', () => {

    it('should update the todo', (done) => {
        //grab 1st todo
        //change text, set completed to be true.
        //expect 200
        //res. completed shoud be true and completeAt should be nubmer.

        var hexId = todos[0]._id.toHexString();
        var text = "This is 1st PATCH test";

        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
                done();
            });
    });

    it('should clear completeAt when todo is not completed', (done) => {
        //grab 2nd todo
        //set completed to be false
        //expect 200
        //res. completed is false and completeAt is null

        var hexId = todos[1]._id.toHexString();
        var text = "This is 2nd PATCH test";

        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
                done();
            });
    })
});