import cheerio from 'cheerio'
import axios from 'axios'

const BASE_URL = 'https://www.futbin.com'

const getCheapestPlayers = async () => {
    const CHEAPEST_PATH = `${BASE_URL}/stc/cheapest`
    const response = await axios.get(CHEAPEST_PATH)
    const $ = cheerio.load(response.data)
    // from 81 ~ 98 
    const allRatings = $('.top-stc-players-col')
    const ratingsArray = []

    $(allRatings).each((i, e) => {
        let ratingObject = {}
        ratingObject.rating = parseInt($(e).find('.top-players-stc-title').text())
        const players = []
        const playersSelector = $(e).find('.top-stc-players-row')

        $(playersSelector).each((index, player) => {
            players.push({
                name: $(player).find('.name-holder').text().replace(/\s/g, ''),
                price: $(player).find('.price-holder-row').text().replace(/\s/g, '')
            })
        })

        ratingObject.players = players
        ratingsArray.push(ratingObject)
    })
    return ratingsArray
}

export default getCheapestPlayers