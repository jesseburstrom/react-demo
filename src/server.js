import express from 'express';
import { routes } from './routes';
import { initializeDbConnection, getDbConnection } from './db';
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, "/build")));
app.use(express.json());

// Add all the routes to our Express server
// exported from routes/index.js
routes.forEach((route) => {
  app[route.method](route.path, route.handler);
});

////////////////////////////////// BLOG //////////////////////////////////
app.get('/api/articles/:name', async (req, res) => {
    const db = getDbConnection('my-blog');
    
    const articleName = req.params.name;
    await db.collection('articles').update({
        name: articleName 
        }, 
        {
        $setOnInsert: {name: articleName , upvotes: 0, comments: []}
        },
        {upsert: true})
    const articleInfo = await db.collection('articles').findOne({ name: articleName })
    res.status(200).json(articleInfo);  
})

app.post('/api/articles/:name/upvote', async (req, res) => {
    const db = getDbConnection('my-blog');

    const articleName = req.params.name;

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
        '$set': {
            upvotes: articleInfo.upvotes + 1,
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    const db = getDbConnection('my-blog');

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
        '$set': {
            comments: articleInfo.comments.concat({ username, text }),
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  
});

/////////////////////////////////////////////////////////////////////////////

////////////////////////////////// TODOLIST //////////////////////////////////
var fakeTodos = [{
    id: 'ae06181d-92c2-4fed-a29d-fb53a6301eb9',
    text: 'Learn about React Ecosystems',
    isCompleted: false,
    createdAt: new Date(),
}, {
    id: 'cda9165d-c263-4ef6-af12-3f1271af5fb4',
    text: 'Get together with friends',
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000 * 7),
}, {
    id: '2e538cc5-b734-4771-a109-dfcd204bb38b',
    text: 'Buy groceries',
    isCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 14),
}];

// The route for getting a list of all todos
app.get('/todos', (req, res) => {
    res.status(200).json(fakeTodos);
});

// The route for getting a list of all todos, but with a delay
// (to display the loading component better)
app.get('/todos-delay', (req, res) => {
    setTimeout(() => res.status(200).json(fakeTodos), 2000);
});

// The route for creating new todo-list items
app.post('/todos', (req, res) => {
    const { text } = req.body;
    if (text) {
        const insertedTodo = {
            id: uuidv4(),
            createdAt: Date.now(),
            isCompleted: false,
            text,
        }
        fakeTodos.push(insertedTodo);
        res.status(200).json(insertedTodo);
    } else {
        res.status(400).json({ message: 'Request body should have a text property' });
    }
});

app.post('/todos/:id/completed', (req, res) => {
    const { id } = req.params;
    const matchingTodo = fakeTodos.find(todo => todo.id === id);
    const updatedTodo = {
        ...matchingTodo,
        isCompleted: true,
    }
    if (updatedTodo) {
        fakeTodos = fakeTodos.map(todo =>
            todo.id === id
                ? updatedTodo
                : todo);
        res.status(200).json(updatedTodo);
    } else {
        res.status(400).json({ message: 'There is no todo with that id' });
    }
})

// The route for deleting a todo-list item
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const removedTodo = fakeTodos.find(todo => todo.id === id);
    fakeTodos = fakeTodos.filter(todo => todo.id !== id);
    res.status(200).json(removedTodo);
});

/////////////////////////////////////////////////////////////////////////////


app.get("*", (req, res) => {
   res.sendFile(path.join(__dirname + "/build/index.html"));
});

initializeDbConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    });

