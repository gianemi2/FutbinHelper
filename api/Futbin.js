const axios = require('axios')

const getCheapestPlayers = require('./getCheapestPlayers')
const baseUrl = 'https://www.futbin.org/futbin/api'

const Futbin = {
    fetchPlayers: async (name) => {
        // If name length is longer than 3 fetch futbinAPI and return response.
        if (name.length > 3) {
            try {
                const response = await axios.get(`${baseUrl}/searchPlayersByName?playername=${name}`, {
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
    getPlayerPrice: async (resourceId, platform) => {
        try {
            const response = await axios.get(`${baseUrl}/fetchPriceInformation?playerresource=${resourceId}&platform=${platform}`)
            console.log(`${baseUrl}/fetchPriceInformation?playerresource=${resourceId}&platform=${platform}`);
            return response.data
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message }
        }
    },
    fetchCheapestPlayers: async () => {
        const data = await getCheapestPlayers()
        return { success: true, data }
    }
}
module.exports = Futbin