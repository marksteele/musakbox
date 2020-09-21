import { Storage } from 'aws-amplify';
import lscache from 'lscache';
import { parseInfo, fetchSongUrl }  from './songs.js';

// Assumption: Will not have more than 1000 playlists. Limitation of amplify ¯\_(ツ)_/¯
// We could work around this by using some partitioning (eg: aplphabet prefixing)
// Not a problem with my collection....
export function fetchPlaylists() {
  let results = lscache.get('playlists');
  if (results === null) {
    return Storage.list(`playlists/`, { level: 'private', maxKeys: 9999 })
    .then(response => {
      results = response.map(item => item.key.slice(10,item.key.length));
      lscache.set('playlists', results, 86400);
      return results;
    });
  } else {
    return Promise.resolve(results);
  }
}

export function loadPlaylist(key) {
  let results = lscache.get(`playlists/${key}`);
  if (results === null) {
    return loadFile(`playlists/${key}`)
      .then(data => Promise.resolve(data.trim().split("\n")))
      .then(songList => {
        return Promise.all(songList.filter(Boolean).map(async (item) => { 
          const url = await fetchSongUrl(item);
          const info = parseInfo(item);
          return { artist: info.artist, title: info.title, url: url, key: item } 
        }))
        .then(results => {
          results = results.filter(item => item.artist !== "unknown");
          lscache.set(`playlists/${key}`, results, 86400);
        });
      });
  } else {
    return Promise.resolve(results);
  }
}

export function loadFile(key) {
  return Storage.get(key, { level: 'private', expires: 60 })
    .then(response => fetch(response))
    .then(fetchResponse => {
      if (fetchResponse.ok) {
        return fetchResponse.text()
      }
      return '';
    });
}

export function savePlaylist(playlist, song) {
  loadFile(`playlists/${playlist}`)
  .then(data => Storage.put(`playlists/${playlist}`, data + song + "\n", { level: 'private' }));
}
