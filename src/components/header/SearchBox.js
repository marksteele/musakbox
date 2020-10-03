import React, { useContext, useState, useCallback } from "react";
import { InputBase, IconButton} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { GlobalContext } from "../GlobalState";
import Fuse from 'fuse.js'

const SearchBox = ({ history, location }) => {

  const [{ songList }, dispatch] = useContext(GlobalContext);
  
  const setSearchResults = useCallback(
    data => {
      dispatch({ type: "setSearchResults", songs: data });
    },
    [dispatch]
  );

  const setActiveView = React.useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const search = () => {
    console.log('searching');
    const options = {
      minMatchCharLength: 2,
      threshold: 0.1,
      distance: 100,
      isCaseSensitive: false,
      keys: [
        "title",
        "artist"
      ]
    };
    const fuse = new Fuse(songList, options);
    const res = fuse.search(searchQuery).map(i => i.item).map(i => songList.findIndex(song => song.key === i.key));
    setSearchResults(res);
  };

  // for controlled input change
  const onChange = e => {
    setSearchQuery(e.target.value);
  };

  const onExit = () => { 
    setSearchResults([]); 
    setActiveView("nowPlaying");
  };

  return (
    <>
      <IconButton color="inherit" aria-label="Menu" onClick={() => onExit()}>
        <ArrowBack />
      </IconButton>
        <InputBase fullWidth placeholder="Search..." autoFocus style={{ color: "#fff", paddingLeft: "16px" }} value={searchQuery} onChange={onChange}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            search();
          }
        }}
        />
    </>
  );
};

export default SearchBox;
