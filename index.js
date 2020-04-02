//@ts-check
import express from 'express'

import { getAllSbcs } from './services/Firebase';
import Futbin from './api/Futbin'

const app = express();

app.get('/', async (req, res) => {
    res.send('Hello world.')
});

app.get('/v1/searchPlayer', async (req, res) => {
    const { name } = req.query;
    const response = await Futbin.fetchPlayers(name)
    res.json(response);
})

app.get('/v1/fetchLastYearSBCS', async (req, res) => {
    const sbcs = await getAllSbcs(0)
    res.json({ success: true, sbcs })
})

app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});