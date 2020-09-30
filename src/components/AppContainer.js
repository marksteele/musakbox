import React, {useEffect, useContext} from "react";
import SimpleAppBar from "./header/SimpleAppBar";
import CurrentSection from "./CurrentSection";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import SwipeMenu from "./SwipeMenu";
import useOnlineStatus from '@rehooks/online-status';
import { GlobalContext } from "./GlobalState";

const body = document.querySelector("body");

const AppContainer = () => {
  const onlineStatus = useOnlineStatus();
  const [{}, dispatch] = useContext(GlobalContext);

  useEffect(() => {
    dispatch({ type: "setIsOnline", isOnline: onlineStatus });
  }, [onlineStatus, dispatch]);

  body.classList.add("dark");
  return (
    <ThemeProvider theme={createMuiTheme({palette: {type: "dark"}})}>
        <CssBaseline/>
        <SimpleAppBar />
        <SwipeMenu />
        <CurrentSection />
    </ThemeProvider>
  );
};
export default AppContainer;
