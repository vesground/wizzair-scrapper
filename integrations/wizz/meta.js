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
  let response;
  try {
    response =  await asyncRequest(url);
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