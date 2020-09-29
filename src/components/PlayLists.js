import React, { useContext, useCallback } from "react";
import { GlobalContext } from "./GlobalState";
import { loadPlaylist, removePlaylist }  from '../playlist.js';
import { ListItem, Divider, ListItemText, IconButton } from "@material-ui/core";
import { Delete } from "@material-ui/icons";


const PlayLists = () => {

  const [{ playlists, activeView }, dispatch] = useContext(GlobalContext);

  const setNowPlaying = data => {
    dispatch({ type: "setNowPlaying", nowPlaying: data.length ? data : [] });
    dispatch({ type: "setActiveView", activeView: 'nowPlaying'});
    dispatch({ type: "setCurrentSong", song: data.length ? data[0] : {}});  
  };

  const handleClick = playlist => {
    loadPlaylist(playlist)
      .then(songs => {
        setNowPlaying(songs);
      });
  };

  const setPlaylists = useCallback(
    (data) => {
      dispatch({ type: "setPlaylists", playlists: data });
    },
    [dispatch]
  );

  const remove = (playlist) => {
    setPlaylists(playlists.filter(x => x !== playlist));
    removePlaylist(playlist);
  }

  const renderResult = playlists.map(playlist => {
    return (
      <>
        <ListItem key={playlist} alignItems="flex-start" button>
          <ListItemText onClick={() => handleClick(playlist)} primary={playlist} />
          <IconButton color="inherit" aria-label="Remove" onClick={() => remove(playlist)}><Delete /></IconButton>
        </ListItem>
        <Divider />
      </>
    );
  });

  return activeView === "playlists" ? renderResult : null;

};

export default PlayLists;