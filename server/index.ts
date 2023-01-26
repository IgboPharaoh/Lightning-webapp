import express from 'express';
import env from './env';
import { initNode, node } from './node';

const app = express();

// first route
app.get('/', async (req, res, next) => {
    try {
        const info = await node.getInfo();

        res.send(`
        <h1>Node info</h1>
        <pre>${JSON.stringify(info, null, 2)}</pre>
        `);
        next();
    } catch (error) {
        next(error);
    }
});

// initialize node and server
console.log('Initializing lightnind node');
initNode().then(() => {
    console.log('lightning node initialized');
    console.log('Starting server.........');

    app.listen(env.PORT, () => {
        console.log(`[server]: Server is running at http://localhost:${env.PORT} `);
    });
});
