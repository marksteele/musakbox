import { Storage, Auth } from 'aws-amplify';
import lscache from 'lscache';

// Assumption: An artist will not have more than 1000 songs. Limitation of amplify ¯\_(ツ)_/¯
// We could work around this by using some partitioning (eg: aplphabet prefixing)
// Not a problem with my collection....
export function listSongs() {
  return Auth.currentAuthenticatedUser().then(user => {
    let results = lscache.get('songs');
    if (results === null) {
      return Promise
      .all(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          .split("")
          .map(item => Storage.list(`songs/${item}`, { level: 'private', identityId: user.username}))
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
  });
}

export function parseInfo(key) {
  const match = key.match(/^songs\/([^/]+)\/(.+)\..+$/);
  return match ? { key: key, artist: match[1], title: match[2], cached: false } : { artist: "unknown", title: key };
}

export function fetchSongUrl(key) {
  return Auth.currentAuthenticatedUser().then(user => {
    return Storage.get(key, { level: 'private', expires: 86400, identityId: user.username }).then(result => result);
  });
}

export function saveSong(artist, album, track, song) {
  return Auth.currentAuthenticatedUser().then(user => {
    return Storage.put(`songs/${artist}/${album}/${track}`, song, { level: 'private', identityId: user.username });
  });
}