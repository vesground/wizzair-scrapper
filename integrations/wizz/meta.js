const {asyncRequest} = require('utils.js');

function parseMeta({body}) {
  try {
    return JSON.parse(body);
  } catch (err) {
    console.error('Could not parse body. Trying fallback.');
  }

  try {
    return JSON.parse(body.substring(1, body.length));
  } catch (err) {
    throw Error(`Could not parse body. ${err}`)
  }
} 

async function fetchMeta(url) {
  const options = {
    url: url,
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9,ro;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
      'connection': 'open',
    }
  }

  let response;
  try {
    response =  await asyncRequest(options);
  } catch (error) {
    throw Error('Request error: ' + error);
  }

  if (response.statusCode !== 200) {
    throw Error('Bad statusCode error: ' + response.statusCode);
  }

  return response;
} 

module.exports = {
  fetchMeta,
  parseMeta,
}
