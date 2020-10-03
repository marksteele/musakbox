export function fetchPlaylists() {
  return Promise.resolve(['listOne']);
}

export function loadPlaylist(key) {
  return Promise.resolve([{key: '/songs/song.mp3',artist: 'foo manchew', title: 'bar baz', cached: false}, {key: '/songs/song2.mp3',artist: 'fizz', title: 'buzz', cached: false}]);
}

export function savePlaylist(playlist, songs) {
    return Promise.resolve();
}

export function removePlaylist(playlist) {
  return Promise.resolve();
}