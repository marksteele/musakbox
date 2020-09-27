import React, { useContext } from "react";
import { GlobalContext } from "./GlobalState";

import {
  ListItem,
  Divider,
  ListItemText
} from "@material-ui/core";

const PlayListsSave = () => {

  const [{ playlists, activeView }, dispatch] = useContext(GlobalContext);

  const setSavePlaylist = data => {
    if (data) {
      dispatch({ type: "setSavePlaylist", savePlaylist: data });
    }
  };

  const renderResult = playlists.map(playlist => {
    return (
      <>
        <ListItem key={playlist} alignItems="flex-start" button onClick={() => setSavePlaylist(playlist)}>
          <ListItemText primary={playlist} />
        </ListItem>
        <Divider />
      </>
    );
  });

  return activeView === "savePlaylist" ? renderResult : null;

};

export default PlayListsSave;