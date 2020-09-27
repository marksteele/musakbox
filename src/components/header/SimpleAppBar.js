import React, { useContext } from "react";
import { GlobalContext } from "../GlobalState";
import SearchBox from "./SearchBox";
import SavePlaylist from "./SavePlaylist";
import PlayListMenu from "./PlayListMenu";
import ArtistMenu from "./ArtistMenu";
import { fetchSongUrl }  from '../../songs.js';
import { AppBar, Toolbar, IconButton, Slide } from "@material-ui/core/";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import { Save, Search, PlaylistPlay, Refresh, Brush, OfflineBolt } from "@material-ui/icons/";
import lscache from 'lscache';
import { Auth } from 'aws-amplify';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function SimpleAppBar(props) {
  const [{ activeView, nowPlaying }, dispatch] = useContext(GlobalContext);

  const setActiveView = React.useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const flushCache = React.useCallback(
    () => {
      dispatch({ type: "setActiveView", activeView: "nowPlaying" });
      dispatch({ type: "setNowPlaying", nowPlaying: [] });
      dispatch({ type: "setCurrentSong", song: {} });
      dispatch({ type: "setPlaylists", playlists: [] });
      dispatch({ type: "setSongList", songs: []});
      dispatch({ type: "setRefreshing", refreshing: true});
      // Probably want to fire this off every 10 minutes...
      const auth = Auth.currentAuthenticatedUser().then(auth => auth);
      if (auth === undefined) {
        alert('No longer logged in! ack!');
      }
    },
    [dispatch]
  );

  const refresh = () => {
    console.log("Flushing localstorage cache");
    lscache.flush();
    console.log("Flushing serviceworker cache");
    if (navigator.serviceWorker !== undefined && navigator.serviceWorker.controller !== null) {
      console.log("Sending flush event to SW");
      navigator.serviceWorker.controller.postMessage({ command: 'flush' });
    }
    console.log("Flushing state");
    flushCache();
  };

  const cacheNowPlaying = () => {
    console.log("Attempting to pre-cache nowPlaying");
    if (navigator.serviceWorker !== undefined && navigator.serviceWorker.controller !== null) {
      console.log("SW enabled, sending pre-cache items to SW");
      Promise
        .all(nowPlaying.map(s => fetchSongUrl(s.key)))
        .then(urls => urls.forEach(url => navigator.serviceWorker.controller.postMessage({ command: 'add', url })))
    }
  }

  const toggleSearch = () => {
    switch(activeView) {
      case "search":
        return <SearchBox />;
      case "savePlaylist":
        return <SavePlaylist />
      case "playlists":
        return <PlayListMenu />;
      case "artists":
        return <ArtistMenu />
      default: 
        return (
          <>
            <IconButton  onClick={() => setActiveView("search")} color="inherit" aria-label="Search"><Search /></IconButton>
            <IconButton  onClick={() => setActiveView("savePlaylist")} color="inherit" aria-label="Save"><Save /></IconButton>
            <IconButton color="inherit" onClick={() => setActiveView("playlists")}  aria-label="Playlists"><PlaylistPlay /></IconButton>
            <IconButton color="inherit" onClick={() => setActiveView("artists")}  aria-label="Artists"><Brush /></IconButton>
            <IconButton color="inherit" onClick={() => refresh()}  aria-label="Refresh"><Refresh /></IconButton>
            <IconButton color="inherit" onClick={() => cacheNowPlaying()}  aria-label="Cache"><OfflineBolt /></IconButton>
          </>
        );
    }
  };

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar id="navbar" position="sticky">
          <Toolbar>{toggleSearch()}</Toolbar>
        </AppBar>
      </HideOnScroll>
    </>
  );
}

export default SimpleAppBar;
