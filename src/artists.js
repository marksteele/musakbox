import { Storage } from 'aws-amplify';
import lscache from 'lscache';

// This is shit-tastic! (tm). It will list every file in order to get directory listing. Limitation of amplify ¯\_(ツ)_/¯
// Also no way to handle more than 1000 results right now... So we'll go through the alphabet.
// Also no way of knowing when result set is truncated. What fun!
function fetchArtists() {
  let results = lscache.get('artists');
  if (results === null) {
    return Promise
      .all(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          .split("")
          .map(item => Storage.list(`songs/${item}`, { level: 'private'}))
      )
      .then(responses => {
        let artists = new Set();
        responses.forEach(response => {
          response.forEach(item => {
            const match = item.key.match(/^[^/]+\/([^/]+)\/.*$/);
            if (match !== null) {
              artists.add(match[1]);
            }
          })
        });
        results = Array.from(artists);
        lscache.set('artists', results, 86400);
        return results;
      });
  } else {
    return Promise.resolve(results);
  }
}

export default fetchArtists;
