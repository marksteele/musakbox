import React, { useContext } from "react";
import { GlobalContext } from "./GlobalState";
import { Remove } from "@material-ui/icons/";
import { IconButton } from "@material-ui/core/";
import { List, ListItem, Typography, Divider, ListItemText} from "@material-ui/core";

const NowPlaying = () => {

  const [{ nowPlaying, activeView }, dispatch] = useContext(GlobalContext);

  const setCurrentSong = data => {
    dispatch({ type: "setCurrentSong", song: data });
  };

  const handleClick = song => {
    setCurrentSong(song);
  };


  const removeFromNowPlaying = (key) => {
    console.log("Remove from now playing: " + key);
    dispatch({ type: "setNowPlaying", nowPlaying: nowPlaying.filter(x => x.key !== key) });
  }

  const renderResult = nowPlaying.map(song => {
    return (
      <List>
        <ListItem key={song.key} alignItems="flex-start">
          <ListItemText onClick={() => handleClick(song)} primary={song.title} secondary={<><Typography component="span" variant="body2" color="textPrimary">{song.artist}</Typography></>}/>
          <IconButton color="inherit" aria-label="Remove from Queue" onClick={() => removeFromNowPlaying(song.key)} ><Remove /></IconButton>
        </ListItem>
        <Divider />
      </List>
    );
  });

  return activeView === "nowPlaying" ? renderResult : null;

};

export default NowPlaying;
