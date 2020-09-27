import React, { useContext } from "react";
import { Typography, IconButton} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { GlobalContext } from "../GlobalState";

const PlayListMenu = ({ history, location }) => {
  const [{}, dispatch] = useContext(GlobalContext);

  const setActiveView = React.useCallback(
    (data) => {
      dispatch({ type: "setActiveView", activeView: data });
    },
    [dispatch]
  );

  const onExit = () => { 
    setActiveView("nowPlaying");
  };

  return (
    <>
      <IconButton color="inherit" aria-label="Menu" onClick={() => onExit()}>
        <ArrowBack />
      </IconButton>
        <Typography>Select a playlist...</Typography>
    </>
  );
};

export default PlayListMenu;
