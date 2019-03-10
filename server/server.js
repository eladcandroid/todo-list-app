const fs = require('fs').promises;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

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
      this.todos = JSON.parse((await fs.readFile(fileName)).toString());
    } catch (e) {
      this.todos = initialTodos;
    }

    return this.todos;
  },

  async save() {
    await fs.writeFile(fileName, JSON.stringify(store.todos));
  },

  async getIndexById(id) {
    try {
      const todos = await this.read();
      return todos.findIndex(todo => todo.id === +id);
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  },

  async getNextTodoId() {
    let maxId = 1;
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
  res.status(200).json(await store.read());
});

app.get('/todos/:id', async (req, res) => {
  const todos = await store.read();
  const todo = todos.find(todo => todo.id === +req.params.id);
  res.status(200).json(todo);
});

app.post('/todos', async (req, res) => {
  console.log('req.body', req.body);
  const todo = req.body;
  todo.id = await store.getNextTodoId();
  store.todos.push(todo);
  await store.save();
  res.status(200).json(req.body);
});

app.put('/todos/:id', async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  store.todos[index] = req.body;
  await store.save();
  res.status(200).json('ok');
});

app.delete('/todos/:id', async (req, res) => {
  const index = await store.getIndexById(req.params.id);
  store.todos.splice(index, 1);
  await store.save();
  res.status(200).json('ok');
});

app.get('/hello', async (req, res) => {
  res.status(200).json('world');
});

app.get('/test', async (req, res) => {
  fetch('http://localhost:3000/todos')
    .then(resp => resp.json()) // Transform the data into json
    .then(function(data) {
      res.send(data);
    });
});

// TESTS
app.get('/testGetAsync', async (req, res) => {
  const fetchResp = await fetch('http://localhost:3000/todos');
  const json = await fetchResp.json();
  res.send(json);
});

app.post('/testPost', async (req, res) => {
  try {
    const fetchResp = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'check',
        completed: false
      })
    });
    const json = await fetchResp.json();
    res.send(json);
  } catch (e) {
    res.send(e);
  }
});



app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
