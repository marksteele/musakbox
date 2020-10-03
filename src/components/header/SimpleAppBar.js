import React, { useContext } from "react";
import { GlobalContext } from "../GlobalState";
import SearchBox from "./SearchBox";
import SavePlaylist from "./SavePlaylist";
import PlayListMenu from "./PlayListMenu";
import ArtistMenu from "./ArtistMenu";
import { fetchSongUrl }  from '../../songs.js';
import { AppBar, Toolbar, IconButton, Slide, Tooltip } from "@material-ui/core/";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import { Settings, Save, Search, PlaylistPlay, Brush, OfflineBolt } from "@material-ui/icons/";

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
  const [{ activeView, nowPlaying, isOnline, songList }, dispatch] = useContext(GlobalContext);

  const setActiveView = React.useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const setIsMenuOpen = data => {
    dispatch({ type: "setIsMenuOpen", isMenuOpen: data });
  };


  const cacheNowPlaying = () => {
    console.log("Attempting to pre-cache nowPlaying");
    if (navigator.serviceWorker !== undefined && navigator.serviceWorker.controller !== null) {
      console.log("SW enabled, sending pre-cache items to SW");
      Promise
        .all(nowPlaying.map(s => fetchSongUrl(songList[s].key)))
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
            <Tooltip title="Search">
              <IconButton  onClick={() => setActiveView("search")} color="inherit" aria-label="Search"><Search /></IconButton>
            </Tooltip>
            <Tooltip title="View artists">
              <IconButton color="inherit" onClick={() => setActiveView("artists")}  aria-label="Artists"><Brush /></IconButton>
            </Tooltip>
            <Tooltip title="Load playlist">
              <IconButton color="inherit" onClick={() => setActiveView("playlists")}  aria-label="Playlists"><PlaylistPlay /></IconButton>
            </Tooltip>
            <Tooltip title="Save a playlist">
                <IconButton disabled={!isOnline} onClick={() => setActiveView("savePlaylist")} color="inherit" aria-label="Save"><Save /></IconButton>
            </Tooltip>
            <Tooltip title="Cache song queue">
              <IconButton disabled={!isOnline} color="inherit" onClick={() => cacheNowPlaying()}  aria-label="Cache"><OfflineBolt /></IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={() => setIsMenuOpen(true)} aria-label="Settings"><Settings /></IconButton>
            </Tooltip>
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
