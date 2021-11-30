import { Storage, Auth } from 'aws-amplify';
import lscache from 'lscache';
import { parseInfo }  from './songs.js';

// Assumption: Will not have more than 1000 playlists. Limitation of amplify ¯\_(ツ)_/¯
// We could work around this by using some partitioning (eg: aplphabet prefixing)
// Not a problem with my collection....
export function fetchPlaylists() {
  let results = lscache.get('playlists');
  if (results === null) {
    return Auth.currentAuthenticatedUser().then(user => {
      return Storage.list(`playlists/`, { level: 'private', maxKeys: 9999, identityId: user.username })
      .then(response => {
        results = response.map(item => item.key.slice(10,item.key.length));
        lscache.set('playlists', results, 86400);
        return results;
      });  
    });
  } else {
    return Promise.resolve(results);
  }
}

export function loadPlaylist(key) {
  const results = lscache.get(`playlists/${key}`);
  if (results === null) {
    console.log("Loading playlist data from S3...");
    return loadFile(`playlists/${key}`)
      .then(data => Promise.resolve(data.trim().split("\n").filter(Boolean).map(i => parseInfo(i))))
      .then(res => {
        lscache.set(`playlists/${key}`, res, 86400);
        return res;
      });
  } else {
    console.log("loaded from cache");
    return Promise.resolve(results ? results : []);
  }
}

export function loadFile(key) {
  return Auth.currentAuthenticatedUser().then(user => {
    return Storage.get(key, { level: 'private', expires: 60, identityId: user.username })
      .then(response => fetch(response))
      .then(fetchResponse => {
        if (fetchResponse.ok) {
          return fetchResponse.text()
        }
        return '';
      });
  });
}

export function savePlaylist(playlist, songs) {
  let data = songs.map(e => e.key).join("\n");
  return Auth.currentUserInfo().then(user => {
    return Storage.put(`playlists/${playlist}`, data, { level: 'private', identityId: user.username })
    .then(() => {
      lscache.set(`playlists/${playlist}`, songs, 86400);
      const currentLists = lscache.get('playlists');
      if (currentLists.indexOf(playlist) === -1) {
        lscache.set('playlists', [ ...currentLists, playlist ]);
      }
      return Promise.resolve();
    });
  });
}


export function removePlaylist(playlist) {
  return Auth.currentAuthenticatedUser().then(user => {
    Storage.remove(`playlists/${playlist}`, { level: 'private', identityId: user.username})
    .then(() => {
      lscache.remove(playlist);
      const results = lscache.get(`playlists`);
      if (results.length) {
        lscache.set('playlists', results.filter(x => x !== playlist), 86400);
      }
    });
  });
}