import Utils from './utils/utils'

export default class Item {

    mockServer = "https://63219be1-0f45-41e6-99fe-d8e89cc28af5.mock.pstmn.io"

    /* id may be numbers only (when item is coming from localStorage/URL) 
    or "/MMM99999999" format when it's coming from the API
    we need documentation but I regret nothing */
    constructor({ id, history, price, thumbnail, title, permalink, market }) {
        this.id = id.replace(/\D/g, '');
        /* market param (format: MMM) will be set whenever the item is 
        being created from localStorage/URL
        otherwise it's coming from the API
        which then will have the following format: /MMM99999999 */
        this.market = market || id.replace(/[\/\d]/g, '');
        this.permalink = permalink;
        this.thumbnail = thumbnail;
        this.title = title;
        this.history = parseHistory({ history, price });
        this.price = this.history[this.history.length - 1].price
    }

    static fetch(marketId, id) {
        //endpoint = `${mockServer}/track/market/${marketId}/product/${id}`
        return fetch(`https://63219be1-0f45-41e6-99fe-d8e89cc28af5.mock.pstmn.io/track/market/${marketId}/product/${id}`)
            .then(pipeResponse)
            .then(res => res.json())
    }

    addHistory({ price }) {
        this.history = parseHistory({ history: this.history, price });
        this.price = this.history[this.history.length - 1].price
    }

    /* returns 
    0 for same price 
    +1 for price increased 
    -1 for price lowered */
    getIndexedHistoryFluctuation(index) {
        if (index <= 0) return 0
        const indexedPrice = this.history[index].price
        const priceBefore = this.history[index - 1].price
        return indexedPrice !== priceBefore
            ? indexedPrice > priceBefore ? 1 : -1
            : 0
    }

    get endpoint() {
        return `https://browserapi.manomano.fr/web/api/v1/product-page/product-cards/fr?product_ids=${this.id}`;
    }

}

function parseHistory({ history, price }) {
    const date = Utils.formatDate()
    if (!history) return [{ price, date }];
    const latest = history[history.length - 1];
    if (!latest || latest.price != price || latest.date != date) {
        return [...history, { price, date }];
    }
    return history;
}

function pipeResponse(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}
