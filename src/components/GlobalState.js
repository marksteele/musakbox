import React, { useReducer } from "react";
export const GlobalContext = React.createContext();

const initialState = {
  savePlaylist: '',
  isMenuOpen: false,
  isOnline: true,
  activeView: '',
  refreshing: true,
  songList: [], // The "everything" list. [{key: 'songs/s3/path.mp3', title: 'choo choo', artist: 'foo man chew'}]
  nowPlaying: [], // List of songs in queue to play
  playlists: [], // Lists of playlists
  artists: [], // Lists of artists
  searchResults: [],
  currentSong: {},
  isPlaying: false,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLooping: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setIsOnline":
      return {
        ...state,
        isOnline: action.isOnline
      }
    case "setIsMenuOpen":
      return {
        ...state,
        isMenuOpen: action.isMenuOpen
      }
    case "setSavePlaylist":
      return {
        ...state,
        savePlaylist: action.savePlaylist
      }
    case "setRefreshing":
      return {
        ...state,
        refreshing: action.refreshing
      }
    case "addToNowPlaying":
      return { ...state, nowPlaying: [action.song, ...state.nowPlaying ]};
    case "setActiveView":
      return {
        ...state,
        activeView: action.activeView
      };
    case "setSongList": 
      return {
        ...state,
        songList: action.songs,
        artists: [...new Set(action.songs.map(x => x.artist))]
      };
    case "setNowPlaying": 
        return {
          ...state,
          nowPlaying: action.nowPlaying
        };  
    case "setPlaylists": 
      return {
        ...state,
        playlists: action.playlists
      };
    case "setCurrentSong":
      return {
        ...state,
        currentSong: action.song
      };
    case "setThemeSelectValue": {
      return {
        ...state,
        themeSelectValue: action.snippet
      };
    }
    case "setSearchResults": {
      return {
        ...state,
        searchResults: action.songs
      };
    }
    case "setMenuOpen": {
      return {
        ...state,
        menuOpen: action.snippet
      };
    }
    default:
      return state;
  }
};

export const GlobalState = props => {
  const globalState = useReducer(reducer, initialState);

  return (
    <GlobalContext.Provider value={globalState}>
      {props.children}
    </GlobalContext.Provider>
  );
};
