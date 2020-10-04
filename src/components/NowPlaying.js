import React, { useContext, useEffect, useState, createRef } from "react";
import { GlobalContext } from "./GlobalState";
import { Remove, PlayForWork } from "@material-ui/icons/";
import { IconButton } from "@material-ui/core/";
import { ListItem, Typography, Divider, ListItemText, Tooltip} from "@material-ui/core";
import { green, red } from '@material-ui/core/colors';



const NowPlaying = () => {

  const [{ nowPlaying, activeView, songList, currentSong }, dispatch] = useContext(GlobalContext);
  const [timerInterval, setTimerInterval] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [renderResult, setRenderResult] = useState(null);
  const [refs, setRefs] = useState([]);

  const setCurrentSong = data => {
    dispatch({ type: "setCurrentSong", song: data });
  };

  const handleClick = song => {
    setCurrentSong(song);
  };

  const removeFromNowPlaying = (idx) => {
    dispatch({ type: "setNowPlaying", nowPlaying: nowPlaying.filter(x => x !== idx) });
    setRefresh(true); 
  }

  const encodings = {
    '+': "%2B",
    '!': "%21",
    '"': "%22",
    '#': "%23",
    '$': "%24",
    '&': "%26",
    '\'': "%27",
    '(': "%28",
    ')': "%29",
    '*': "%2A",
    ',': "%2C",
    ':': "%3A",
    ';': "%3B",
    '=': "%3D",
    '?': "%3F",
    '@': "%40",
  };
  
  const encodeS3URI = (filename) => {
    return encodeURI(filename).replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/img, (match) => encodings[match]);
  }

  useEffect(() => {
    setRefresh(true);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    if (nowPlaying.length) {
      setTimerInterval(setInterval(() => {
        return caches
          .open('musakbox')
          .then(cache => {
            Promise.all(
              nowPlaying
                .filter(idx => songList[idx].cached === false)
                .map(idx => {
                  return cache
                    .match(encodeS3URI(songList[idx].key))
                    .then(res => {
                      if (res) { 
                        dispatch({ type: "setCacheStatus", cacheStatus: {status: true, idx: idx}});
                        return true;
                      } else {
                        return false;
                      }
                    })
                  })
            ).then(results => {
              if (results.includes(true)) {
                setRefresh(true); // Trigger refresh when cache status changes.
              }
            });
          });
      },2000));
      setRefs(nowPlaying.reduce((acc, idx) => { acc[idx] = createRef(); return acc;}, {}));
    }
  }, [nowPlaying]);  

  useEffect(() => {
    if (refresh) {
      setRenderResult(nowPlaying.map(idx => {
        return (
          <div key={idx} ref={refs[idx]}>
            <ListItem key={idx} alignItems="flex-start">
              <ListItemText onClick={() => handleClick(idx)} primary={songList[idx].title} secondary={<><Typography component="span" variant="body2" color="textPrimary">{songList[idx].artist}</Typography></>}/>
              <Tooltip title="Remove from queue">
                <IconButton color="inherit" aria-label="Remove from Queue" onClick={() => removeFromNowPlaying(idx)} ><Remove /></IconButton>
              </Tooltip>
                <Tooltip title="Cached">
                <IconButton style={{ color: songList[idx].cached ? green[500] : red[500] }} color="inherit" aria-label="Cached" ><PlayForWork /></IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
          </div>
        );
      }));
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (currentSong) {
      refs[currentSong].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Programatically change the style and add glow. Works, but then would need to keep track of previous song, besides it scrolls to current song.
      // refs[currentSong].current.style.outline = 'none';
      // refs[currentSong].current.style.borderColor = '#9ecaed';
      // refs[currentSong].current.style.boxShadow = '0 0 10px #9ecaed';
    }
  }, [currentSong]);

  return activeView === "nowPlaying" ? renderResult : null;

};

export default NowPlaying;
