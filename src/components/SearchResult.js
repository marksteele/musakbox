import React, { useContext } from "react";
import { GlobalContext } from "./GlobalState";

import {
  ListItem,
  Typography,
  Divider,
  ListItemText
} from "@material-ui/core";

const SearchResult = () => {

  const [{ searchResults, activeView }, dispatch] = useContext(GlobalContext);

  const setCurrentSong = data => {
    dispatch({ type: "addToNowPlaying", song: data});
  };

  const handleClick = song => {
    setCurrentSong(song);
  };

  const renderResult = searchResults.map(song => {
    return (
      <>
        <ListItem key={song.key} alignItems="flex-start" button onClick={() => handleClick(song)}>
          <ListItemText primary={song.title} secondary={<><Typography component="span" variant="body2" color="textPrimary">{song.artist}</Typography></>}/>
        </ListItem>
        <Divider />
      </>
    );
  });

  return activeView === 'search' ? renderResult : null;

};

export default SearchResult;
