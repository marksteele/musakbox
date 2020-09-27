import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import SimpleAppBar from "./header/SimpleAppBar";
import CurrentSection from "./CurrentSection";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const body = document.querySelector("body");

const AppContainer = () => {
  body.classList.add("dark");
  return (
    <ThemeProvider theme={createMuiTheme({palette: {type: "dark"}})}>
            <CssBaseline/>

      <Router>
        <SimpleAppBar />
        <Route component={CurrentSection} />
      </Router>
    </ThemeProvider>
  );
};
export default AppContainer;
