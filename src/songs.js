import { Storage } from 'aws-amplify';
import lscache from 'lscache';

// Assumption: An artist will not have more than 1000 songs. Limitation of amplify ¯\_(ツ)_/¯
// We could work around this by using some partitioning (eg: aplphabet prefixing)
// Not a problem with my collection....
export function fetchSongs(artist) {
  if (artist === undefined) {
    return Promise.resolve([]);
  }
  let results = lscache.get(`songs/${artist}/`);
  if (results === null) {
    return Storage
      .list(`songs/${artist}/`, { level: 'private' })
      .then(response => {
        return Promise.all(response.map(async (item) => { 
          const url = await fetchSongUrl(item.key);
          const info = parseInfo(item.key);
          return { artist: info.artist, title: info.title, url: url, key: item.key } 
        }))
        .then(results => {
          results = results.filter(item => item.artist !== "unknown");
          lscache.set(`songs/${artist}/`, results, 86400);
          return results;
        });
      });
  } else {
    return Promise.resolve(results);
  }
}

export function parseInfo(key) {
  const match = key.match(/^songs\/([^/]+)\/(.+)\..+$/);
  return match ? { artist: match[1], title: match[2] } : { artist: "unknown", title: key };
}

export async function fetchSongUrl(key) {
  return Storage.get(key, { level: 'private', expires: 86400 }).then(result => result);
}
