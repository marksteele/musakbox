import React, { useContext, useCallback } from "react";
import { GlobalContext } from "./GlobalState";
import { ListItem, Divider, ListItemText} from "@material-ui/core";

const ArtistList = () => {

  const [{ songList, artists, activeView }, dispatch] = useContext(GlobalContext);
  
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

  const handleClick = artist => {
    setSearchResults(songList.filter(s => s.artist === artist).map(x => songList.findIndex(y => x.key === y.key)));
    setActiveView("search");
  };

  const renderResult = artists.map(artist => {
    return (
      <>
        <ListItem key={artist} alignItems="flex-start" button onClick={() => handleClick(artist)}>
          <ListItemText primary={artist} />
        </ListItem>
        <Divider />
      </>
    );
  });

  return activeView === "artists" ? renderResult : null;

};

export default ArtistList;