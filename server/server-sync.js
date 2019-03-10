const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 3000;
const fileName = './todos.json';

const app = express();

const initialTodos = [
  {
    id: 1,
    title: 'Throw garbage',
    completed: false
  },
  {
    id: 2,
    title: 'Wash the dishes',
    completed: false
  }
];

const store = {
  read() {
    if (fs.existsSync(fileName)) {
      store.todos = JSON.parse(fs.readFileSync(fileName).toString());
    } else {
      store.todos = initialTodos;
    }

    return store.todos;
  },

  save() {
    fs.writeFileSync(fileName, JSON.stringify(store.todos));
  },

  getIndexById(id) {
    return this.read().findIndex(todo => todo.id === +id);
  },

  findBiggestTodoId() {
    maxId = 1;
    const todos = this.read();
    todos.forEach(todo => {
      if (todo.id > maxId) maxId = todo.id;
    });
    return maxId + 1;
  },

  todos: []
};

app.use(bodyParser.json());
app.use(cors());

app.get('/todos', (req, res) => {
  res.json(store.read());
});

app.get('/todos/:id', (req, res) => {
  res.json(store.read().find(todo => todo.id === +req.params.id));
});

app.put('/todos/:id', (req, res) => {
  let index = store.getIndexById(req.params.id);
  store.todos[index] = req.body;
  store.save();
  res.json('ok');
});

app.delete('/todos/:id', (req, res) => {
  let index = store.getIndexById(req.params.id);
  delete store.todos[index];
  store.save();
  res.json('ok');
});

app.post('/todos', async (req, res) => {
  const todo = req.body;
  todo.id = store.findBiggestTodoId();
  store.todos.push(todo);
  store.save();
  res.json('ok');
});

app.get('/hello', (req, res) => {
  res.send('world');
});

app.listen(port, () => {
  console.log(`Listening at http://localhost: ${port}`);
});
