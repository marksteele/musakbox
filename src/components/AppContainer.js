import React from "react";
import SimpleAppBar from "./header/SimpleAppBar";
import CurrentSection from "./CurrentSection";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import SwipeMenu from "./SwipeMenu";

const body = document.querySelector("body");

const AppContainer = () => {
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
