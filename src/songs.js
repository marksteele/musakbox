import { Storage } from 'aws-amplify';
import lscache from 'lscache';

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
