import React, { useContext } from "react";
import { GlobalContext } from "./GlobalState";
import { loadPlaylist }  from '../playlist.js';

import {
  ListItem,
  Divider,
  ListItemText
} from "@material-ui/core";

const PlayLists = () => {

  const [{ playlists, activeView }, dispatch] = useContext(GlobalContext);

  const setNowPlaying = data => {
    if (data.length) {
      dispatch({ type: "setNowPlaying", nowPlaying: data });
      dispatch({ type: "setActiveView", activeView: 'nowPlaying'});
      dispatch({ type: "setCurrentSong", song: data[0]});  
    }
  };

  const handleClick = playlist => {
    loadPlaylist(playlist)
      .then(songs => {
        setNowPlaying(songs);
      });
  };

  const renderResult = playlists.map(playlist => {
    return (
      <>
        <ListItem key={playlist} alignItems="flex-start" button onClick={() => handleClick(playlist)}>
          <ListItemText primary={playlist} />
        </ListItem>
        <Divider />
      </>
    );
  });

  return activeView === "playlists" ? renderResult : null;

};

export default PlayLists;