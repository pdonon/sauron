import Storage from "./modules/storage";
const mockServer = "https://63219be1-0f45-41e6-99fe-d8e89cc28af5.mock.pstmn.io"

function getItem(market, id) {
  return fetch(
    `${mockServer}/track/market/${market}/product/${id}`
  ).then(function (res) {
    return res.json();
  });
}

Storage.get()
  .then((items) => items.forEach(update))
  .catch(console.log);

function update(item) {
  return getItem(item.market, item.id)
    .then((data) => item.addHistory(data))
    .then(() => saveItem(item));
}

function saveItem(item) {
  return Storage.saveItem(item).then((success) =>
    console.info(success.message)
  );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request) {
    if (request.cmd == "fetch") {
      const data = request.data;
      if (!data || !data.itemId) {
        return sendResponse({ sender: "background.js", data: null });
      }
      getItem(data.marketId, data.itemId)
        .then(function (result) {
          sendResponse({ sender: "background.js", data: result });
        })
        .catch(function (error) {
          console.warn(
            `There was an error trying to fetch article ${data.marketId}${data.itemId}`,
            error
          );
          sendResponse({ sender: "background.js", data: null });
        });
    }
  }
  return true;
});
