import React, { useContext, useCallback } from "react";
import { InputBase, IconButton } from "@material-ui/core";
import { ArrowBack, Save } from "@material-ui/icons";
import { GlobalContext } from "../GlobalState";
import {savePlaylist as save} from '../../playlist';

const SavePlaylist = ({ history, location }) => {

  const [{ nowPlaying, activeView, savePlaylist, songList }, dispatch] = useContext(GlobalContext);
  
  const setActiveView = useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const setSavePlaylist = useCallback(
    (data) => {
      dispatch({ type: "setSavePlaylist", savePlaylist: data });
    },
    [dispatch]
  );

  // for controlled input change
  const onChange = e => {
    setSavePlaylist(e.target.value);
  };

  const onExit = () => { 
    setActiveView("nowPlaying");
  };
  
  const setRefreshing = useCallback(
    data => {
      dispatch({ type: "setRefreshing", refreshing: data });
    },
    [dispatch]
  );

  const onSave = () => {
    if (!savePlaylist) {
      alert('You must select or enter a playlist name');
      return;
    }
    console.log("Saving playlist...");
    save(savePlaylist, nowPlaying.map(x => songList[x])).then(() => {
      setActiveView("nowPlaying");
      setRefreshing(true);
    });
  }

  const renderResult = (
  <>
      <IconButton color="inherit" aria-label="Menu" onClick={() => onExit()}><ArrowBack /></IconButton>
        <InputBase fullWidth placeholder="Select or enter a playlist name..." autoFocus style={{ color: "#fff", paddingLeft: "16px" }} value={savePlaylist} onChange={onChange}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            onSave();
          }
        }} />
        <IconButton onClick={() => onSave()} color="inherit" aria-label="Save"><Save /></IconButton>

    </>
  );  
  return activeView === "savePlaylist" ? renderResult : null;

};

export default SavePlaylist;
