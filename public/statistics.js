async function getResponse(route) {
  const data = await fetch(route);
  const resp = await data.json();

  return resp;
}

const Statistics  = {

async getMostPopular(bandId) {
  const resp = await getResponse(`/api/${bandId}/frequent`);
  return resp;
},

async getBandsAlbums(bandId) {
  const resp = await getResponse(`/api/${bandId}/albums`);
  return resp;
},

async getPosCount(bandId) {
  const resp = await getResponse(`/api/${bandId}/pos`);
  return resp;
},

async getPopularByChar(bandId, char) {
  const resp = await getResponse(`/api/${bandId}/${char}`);
  return resp;
},

partOfSpeech: {
  n: 'noun',
  v: 'verb',
  r: 'adverb',
  a: 'adjective',
  func: 'function word',
  num: 'number'
}

}
