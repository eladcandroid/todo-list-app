const fs = require('fs').promises;
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
  async read() {
    try {
      await fs.access(fileName);
      store.todos = JSON.parse((await fs.readFile(fileName)).toString());
    } catch (e) {
      store.todos = initialTodos;
    }

    return store.todos;
  },

  async save() {
    await fs.writeFile(fileName, JSON.stringify(store.todos));
  },

  async getIndexById(id) {
    try {
      const todos = await this.read();
      return todos.findIndex(todo => todo.id === +id);
    } catch (e) {
      console.log(e, todos);
    }
  },

  async getNextTodoId() {
    maxId = 1;
    const todos = await this.read();
    todos.forEach(todo => {
      if (todo.id > maxId) maxId = todo.id;
    });
    return maxId + 1;
  },

  todos: []
};

app.use(bodyParser.json());
app.use(cors());

app.get('/todos', async (req, res) => {
  res.json(await store.read());
});

app.get('/todos/:id', async (req, res) => {
  const todos = await store.read();
  const todo = todos.find(todo => todo.id === +req.params.id);
  res.json(todo);
});

app.post('/todos', async (req, res) => {
  const todo = req.body;
  todo.id = await store.getNextTodoId();
  store.todos.push(todo);
  await store.save();
  res.json('ok');
});

app.put('/todos/:id', async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  store.todos[index] = req.body;
  await store.save();
  res.json('ok');
});

app.delete('/todos/:id', async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  store.todos.splice(index, 1);
  await store.save();
  res.json('ok');
});

app.get('/hello', async (req, res) => {
  res.send('world');
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
