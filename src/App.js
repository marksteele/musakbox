import React, { Component } from 'react'
import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { fetchSongs }  from './songs.js';
import fetchArtists  from './artists.js';
import { loadPlaylist, fetchPlaylists }  from './playlist.js';
import SongList from './components/SongList';
import ArtistList from './components/ArtistList';
import Player from './components/Player';
import PlayLists from './components/PlayLists';
import lscache from 'lscache';

Amplify.configure(awsconfig);

class App extends Component {
  constructor() {
    super();
    this.state = {
      songs: [],
      artists: [],
      playlists: [],
      currentSong: 0,
      currentArtist: '',
      currentPlaylist: ''
    }
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleSongClick = this.handleSongClick.bind(this);
    this.handleArtistClick = this.handleArtistClick.bind(this);
    this.handlePlaylistClick = this.handlePlaylistClick.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  componentWillMount(){
    this.refresh();
  }

  clearCache() {
    lscache.flush();
    this.setState({
      songs: [],
      artists: [],
      playlists: [],
      currentSong: 0,
      currentArtist: '',
      currentPlaylist: ''
    });
    this.refresh();
  }

  refresh() {
    fetchArtists()
    .then(artists => {
      this.setState({artists: artists});
    });
    fetchPlaylists()
    .then(playlists => {
      this.setState({playlists: playlists});
    })
  }

  handlePrev() {
    const nextSong = parseInt(this.state.currentSong, 10) - 1;
    if(this.state.currentSong > 0) {
      this.setState({currentSong: nextSong});
    }
  }

  handleNext() {
    const nextSong = parseInt(this.state.currentSong, 10) + 1;
    if(this.state.currentSong < this.state.songs.length - 1) {
      this.setState({currentSong: nextSong});
    }
  }

  handleSongClick(id) {
    this.setState({currentSong: id});
  }

  handleArtistClick(id) {
    this.setState({currentArtist: id, currentPlaylist: 'pickone'});
    fetchSongs(this.state.artists[id])
    .then(songs => {
      this.setState({songs: songs});
    })
  }

  handlePlaylistClick(id) {
    this.setState({currentPlaylist: id, currentArtist: 'pickone' }); 
    loadPlaylist(this.state.playlists[id])
    .then(songs => {
      this.setState({songs: songs});
    });
  }

  render() {
    return (
      <div className='container'>
        <div >
          <h1 className="title">MusakBox</h1>
        </div>
        <div>
          <PlayLists playlists={this.state.playlists} currentPlaylist={this.state.currentPlaylist} handlePlaylistClick={this.handlePlaylistClick} />
          <ArtistList artists={this.state.artists} currentArtist={this.state.currentArtist} handleArtistClick={this.handleArtistClick} />
          <button className="menu-item" onClick={() => {
            let array = this.state.songs;
            for(let i = array.length - 1; i > 0; i--){
              const j = Math.floor(Math.random() * i)
              const temp = array[i]
              array[i] = array[j]
              array[j] = temp
            }
            this.setState({songs: array});
          }}>Shuffle</button>
          <button className="menu-item" onClick={this.clearCache}>Flush cache</button>
        </div>
        {
          this.state.songs && this.state.songs.length && this.state.songs[this.state.currentSong] !== undefined
            ? <>
            <SongList
            songs={this.state.songs}
            currentSongNumber={this.state.currentSong}
            handleSongClick={this.handleSongClick}
            playlists={this.state.playlists}
          />
            <Player
                currentSongUrl={this.state.songs[this.state.currentSong].url}
                currentSongTitle={this.state.songs[this.state.currentSong].title}
                playPrev={this.handlePrev}
                playNext={this.handleNext}
              />
              </>
            : null
        }
      </div>
    );
  }
}

export default withAuthenticator(App)
