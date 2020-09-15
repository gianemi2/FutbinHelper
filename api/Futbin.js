import axios from 'axios'
import cheerio from 'cheerio'

import getCheapestPlayers from './getCheapestPlayers'

const Futbin = {
    fetchPlayers: async (name) => {

        // If name length is longer than 3 fetch futbinAPI and return response.
        if (name.length > 3) {
            try {
                const response = await axios.get(`https://www.futbin.org/futbin/api/searchPlayersByName?playername=${name}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                if (response.data.data) {
                    return response.data.data;
                }
            } catch (error) {
                console.log(error);
                return { success: false, message: error }
            }
        }
    },
    fetchCheapestPlayers: async () => {
        const data = await getCheapestPlayers()
        return { success: true, data }
    }
}
export default Futbin;