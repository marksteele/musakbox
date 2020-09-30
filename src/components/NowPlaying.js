import React, { useContext } from "react";
import { GlobalContext } from "./GlobalState";
import { Remove, PlayForWork } from "@material-ui/icons/";
import { IconButton } from "@material-ui/core/";
import { List, ListItem, Typography, Divider, ListItemText, Tooltip} from "@material-ui/core";
import { green, red } from '@material-ui/core/colors';
import {isCached} from '../songs'

const NowPlaying = () => {

  const [{ nowPlaying, activeView }, dispatch] = useContext(GlobalContext);
  const [cachedFiles, setSetCachedfiles] = React.useState([]);

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

  React.useEffect(() => {
    const fetchCachedFiles = async () => {
      const files = await isCached(nowPlaying);
      setSetCachedfiles(files);
    };
    fetchCachedFiles();
  }, [nowPlaying]);  

  const renderResult = cachedFiles.map(song => {
    return (
      <List>
        <ListItem key={song.key} alignItems="flex-start">
          <ListItemText onClick={() => handleClick(song)} primary={song.title} secondary={<><Typography component="span" variant="body2" color="textPrimary">{song.artist}</Typography></>}/>
          <Tooltip title="Remove from queue">
            <IconButton color="inherit" aria-label="Remove from Queue" onClick={() => removeFromNowPlaying(song.key)} ><Remove /></IconButton>
          </Tooltip>
            <Tooltip title="Cached">
            <IconButton style={{ color: song.cached ? green[500] : red[500] }} color="inherit" aria-label="Cached" ><PlayForWork /></IconButton>
          </Tooltip>
        </ListItem>
        <Divider />
      </List>
    );
  });

  return activeView === "nowPlaying" ? renderResult : null;

};

export default NowPlaying;
