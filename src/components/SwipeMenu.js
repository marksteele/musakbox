import React, { useContext } from "react";
import { SwipeableDrawer, Divider, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Refresh, DeleteSweep, ExitToApp, Settings, ClearAll } from "@material-ui/icons";
import { GlobalContext } from "./GlobalState";
import "./darkMode.css";
import lscache from 'lscache';
import { Auth } from 'aws-amplify';

const SwipeMenu = () => {
  const [{ isMenuOpen, isOnline }, dispatch] = useContext(GlobalContext);

  const setIsMenuOpen = data => {
    dispatch({ type: "setIsMenuOpen", isMenuOpen: data });
  };

  const refresh = () => {
    console.log("Flushing localstorage cache");
    lscache.flush();
    console.log("Flushing serviceworker cache");
    if (navigator.serviceWorker !== undefined && navigator.serviceWorker.controller !== null) {
      console.log("Sending flush event to SW");
      navigator.serviceWorker.controller.postMessage({ command: 'flush' });
    }
    console.log("Flushing state");
    dispatchState();
      // Probably want to fire this off every 10 minutes...
      const auth = Auth.currentAuthenticatedUser().then(auth => auth);
      if (auth === undefined) {
        alert('No longer logged in! ack!');
        window.location.reload();
      }
  };

  const dispatchState = () => {
    dispatch({ type: "setActiveView", activeView: "nowPlaying" });
    dispatch({ type: "setNowPlaying", nowPlaying: [] });
    dispatch({ type: "setCurrentSong", song: {} });
    dispatch({ type: "setPlaylists", playlists: [] });
    dispatch({ type: "setSongList", songs: []});
    dispatch({ type: "setRefreshing", refreshing: true});
    dispatch({ type: "setIsMenuOpen", isMenuOpen: false});
  }

  const refreshMetadata = () => {
    console.log("Flushing localstorage cache");
    lscache.flush();
    dispatchState();
  }

  const logout = () => {
    Auth.signOut().then(() => {
      console.log("Signed out");
      window.location.reload();
    });
  }

  const clearNowPlaying = () => {
    dispatch({ type: 'setNowPlaying', nowPlaying: []});
    dispatch({ type: "setIsMenuOpen", isMenuOpen: false});
  }

  return (
    <SwipeableDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} onOpen={() => setIsMenuOpen(true)}>
      <div style={{ width: "300px" }}>
        <List>
          <ListItem>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <Divider />
          <ListItem button disabled={!isOnline} onClick={() => refreshMetadata()}>
            <ListItemIcon color="inherit" aria-label="Refresh"><Refresh /></ListItemIcon>
            <ListItemText primary="Delete metadata cache" />
          </ListItem>        
          <ListItem button disabled={!isOnline} onClick={() => refresh()}>
            <ListItemIcon color="inherit" aria-label="Delete all caches"><DeleteSweep /></ListItemIcon>
            <ListItemText primary="Delete all caches" />
          </ListItem>
          <ListItem button onClick={() => clearNowPlaying()}>
            <ListItemIcon color="inherit" aria-label="Delete all caches"><ClearAll /></ListItemIcon>
            <ListItemText primary="Clear now playing" />
          </ListItem>
          <ListItem button onClick={() => logout()}>
            <ListItemIcon color="inherit" aria-label="Logout"><ExitToApp /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </div>
    </SwipeableDrawer>
  );
}

export default SwipeMenu;