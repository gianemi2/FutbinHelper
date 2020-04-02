import cheerio from 'cheerio'
import axios from 'axios'
import { db } from '../services/Firebase'

const BASE_URL = 'https://www.futbin.com'
const START = 900;
const ENDS = 999;

const fetchLastYearSBCS = async () => {
    const SBC_PATH = `${BASE_URL}/19/squad-building-challenges`
    const response = await axios.get(SBC_PATH)
    const $ = cheerio.load(response.data)
    const challengePromises = []
    const allChallenges = $('.all_sbc_sets_area .set_col > a')

    $(allChallenges).each((i, e) => {
        if (i >= START && i <= ENDS) {
            const sbcLink = $(e).attr('href')
            console.log(i, sbcLink)
            challengePromises.push(fetchSbcInfo(sbcLink))
        }
    })

    return allSkippingErrors(challengePromises)
        .then(res => {
            const sbc = db.collection('sbc')
            const errors = []
            res.forEach(value => {
                if (value.success == undefined) {
                    sbc.doc(value.id.toString()).set(value)
                } else {
                    errors.push(value.error.where)
                }
            })

            return {
                errors,
                success: true,
                data: res
            }
        })
        .catch(error => console.error('Error with promises all!', error))

}

const allSkippingErrors = (promises) => {
    return Promise.all(
        promises.map(p => p.catch(error => {
            return {
                success: false,
                error: error
            }
        }))
    )
}

const setupPrices = json => {
    try {
        const jsonPrices = JSON.parse(json)
        const prices = jsonPrices.map(price => {
            return {
                date: new Date(price[0]).toLocaleDateString(),
                price: price[1],
                timestamp: price[0]
            }
        })
        return prices
    } catch (error) {
        return {
            date: false,
            price: 0
        }
    }
}

export const fetchSbcInfo = (sbc_url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.get(BASE_URL + sbc_url)
            const $ = cheerio.load(data)

            const prices = {
                ps4: setupPrices($('#ps4-graph-daily').text()),
                xone: setupPrices($('#xone-graph-daily').text()),
                pc: setupPrices($('#pc-graph-daily').text())
            }

            const $sbcs = $('.all_sbc_sets_area .chal_col')
            const sbcs = []

            $sbcs.each((i, e) => {

                const requirements = []

                $(e).find('.reqs_area div').each((i, e) => {
                    requirements.push($(e).text())
                })

                const sbc = {
                    reward: $(e).find('.pack_small_reward_name_right').text(),
                    price: {
                        ps4: $(e).find('.est_chal_prices_holder').data('ps-price'),
                        xone: $(e).find('.est_chal_prices_holder').data('xone-price'),
                        pc: $(e).find('.est_chal_prices_holder').data('pc-price'),
                    },
                    requirements
                }

                sbcs.push(sbc)
            })
            const set = {
                id: $('#set-info').data('set-id'),
                title: $('.chal_page_name').text().trim(),
                prices,
                sbcs,
                dates: {
                    startsOn: prices.ps4[0] ? prices.ps4[0].date : null,
                    endsOn: prices.ps4[prices.ps4.length - 1] ? prices.ps4[prices.ps4.length - 1].date : null
                }
            }
            resolve(set)
        } catch (error) {
            reject({
                code: error.message,
                where: sbc_url
            })
        }
    })
}

export default fetchLastYearSBCS