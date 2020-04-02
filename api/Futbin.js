import axios from 'axios'

const Futbin = {
    fetchPlayers: async (name) => {
        var urlencoded = new URLSearchParams();
        urlencoded.append("playername", name);

        // If name length is longer than 3 fetch futbinAPI and return response.
        if (name.length > 3) {
            const response = await axios.post(`https://www.futbin.org/futbin/api/searchPlayersByName`, urlencoded, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            if (response.data.data) {
                return response.data.data;
            }
        }
    }
}
export default Futbin;