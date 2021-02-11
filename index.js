const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000;

const { getAllSbcs, getLastYearTodaySbcs } = require('./services/Firebase')

const Futbin = require('./api/Futbin');
const { urlencoded } = require('express');

app.use(cors())

app.get('/', async (req, res) => {
    res.send('IM FUTBIN BEST API!')
});

app.get('/v1/cheapestPlayers', async (req, res) => {
    const response = await Futbin.fetchCheapestPlayers()
    res.json(response)
})

app.get('/v1/searchPlayer', async (req, res) => {
    const { name } = req.query;
    const response = await Futbin.fetchPlayers(name)

    const names = response.reduce((prev, curr) => {
        return `${prev}
${curr.playername} - ${curr.rating} - ${curr.position}`
    }, '')
    axios(`https://api.telegram.org/bot1616578824:AAEZE-hG7tGPsLqXU9EUv0pcC5TUwWFCMZw/sendMessage?chat_id=-599738450&text=${encodeURI(names)}`)
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