import React, { useContext, useCallback, useState } from "react";
import { GlobalContext } from "./GlobalState";
import {saveSong as save} from '../songs';
import { TextField, IconButton } from "@material-ui/core";
import { Publish } from "@material-ui/icons/";

const UploadFile = () => {

  const [{ activeView }, dispatch] = useContext(GlobalContext);
  const [track, setTrack] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [trackData, setTrackData] = useState({});

  const setActiveView = React.useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const saveSong = () => {
      if (!track || !artist || !album || !trackData.name) {
          alert("You must specify the artist, album, and track and add a file");
          return;
      }
      return save(artist, album, `${track}.${trackData.name.substring(trackData.name.lastIndexOf(".")+1)}`, trackData).then(() => {
        setTrack("");
        setArtist("");
        setAlbum("");
        setTrackData(null);
        setActiveView("nowPlaying");  
      });
  }

    const renderResult = 
    (
      <div>
            <TextField label="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
            <TextField label="Album" value={album} onChange={(e) => setAlbum(e.target.value)}/>
            <TextField label="Track" value={track} onChange={(e) => setTrack(e.target.value)} />
            <input type="file" accept="audio/*" onChange={(e) => setTrackData(e.target.files[0])} />
            <IconButton onClick={saveSong}><Publish /></IconButton>
     </div>
    )

  return activeView === "upload" ? renderResult : null;

};

export default UploadFile;