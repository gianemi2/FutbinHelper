//@ts-check
import express from 'express'
var cors = require('cors')

import { getAllSbcs, getLastYearTodaySbcs } from './services/Firebase';
import Futbin from './api/Futbin'

const app = express();
app.use(cors())
const port = process.env.PORT || 5000;

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

app.get('/v1/getLastYearTodaySbcs', async (req, res) => {
    const sbcs = await getLastYearTodaySbcs();
    res.json({ success: true, sbcs });
})

app.get('/v1/getSbcForFC', async (req, res) => {

    const dateParameter = {
        start: req.query.start,
        end: req.query.end
    }

    const sbcs = await getAllSbcs(0, 50, dateParameter);
    const adaptedSbcs = sbcs.map(sbc => {
        return {
            id: sbc.id,
            start: sbc.dates.startsOn,
            end: sbc.dates.endsOn,
            title: sbc.title,
            editable: false,
            extendedProps: {
                prices: sbc.prices,
                childSbc: sbc.sbcs
            }
        }
    })
    res.json(adaptedSbcs)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});