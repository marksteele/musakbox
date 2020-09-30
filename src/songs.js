import { Storage } from 'aws-amplify';
import lscache from 'lscache';


const encodings = {
  '+': "%2B",
  '!': "%21",
  '"': "%22",
  '#': "%23",
  '$': "%24",
  '&': "%26",
  '\'': "%27",
  '(': "%28",
  ')': "%29",
  '*': "%2A",
  ',': "%2C",
  ':': "%3A",
  ';': "%3B",
  '=': "%3D",
  '?': "%3F",
  '@': "%40",
};

const encodeS3URI = (filename) => {
  return encodeURI(filename).replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/img, (match) => encodings[match]);
}

export function isCached(songs) {
  return caches
    .open('musakbox')
    .then(cache => {
      return Promise.all(songs.map(song => {
        return cache
          .match(encodeS3URI(song.key))
          .then(res => {
            return {...song, cached: res ? true : false};
          })
      }))
      .then(res => {
        console.log(res);
        return res;
      });
    });
}

// Assumption: An artist will not have more than 1000 songs. Limitation of amplify ¯\_(ツ)_/¯
// We could work around this by using some partitioning (eg: aplphabet prefixing)
// Not a problem with my collection....
export function listSongs() {
  let results = lscache.get('songs');
  if (results === null) {
    return Promise
    .all(
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        .split("")
        .map(item => Storage.list(`songs/${item}`, { level: 'private'}))
    )
    .then(responses => {
      let songs = [];
      responses.forEach(response => {
        response.forEach(item => {
          songs.push(parseInfo(item.key));
        })
      });
      lscache.set('songs', songs, 86400);
      return songs;
    });
  } else {
    return Promise.resolve(results);
  }
}

export function parseInfo(key) {
  const match = key.match(/^songs\/([^/]+)\/(.+)\..+$/);
  return match ? { key: key, artist: match[1], title: match[2] } : { artist: "unknown", title: key };
}

export function fetchSongUrl(key) {
  return Storage.get(key, { level: 'private', expires: 86400 }).then(result => result);
}
