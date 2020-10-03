export function listSongs() {
  return Promise.resolve([{key: '/songs/song.mp3',artist: 'foo manchew', title: 'bar baz', cached: false}, {key: '/songs/song2.mp3',artist: 'fizz', title: 'buzz', cached: false}]);
}

export function fetchSongUrl(key) {
  return Promise.resolve(key);
}
