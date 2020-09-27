import React, { useContext, useEffect, useCallback, Suspense } from "react";
import { Grid, CircularProgress}  from "@material-ui/core";
import { GlobalContext } from "./GlobalState";
import {listSongs} from '../songs';
import {fetchPlaylists} from '../playlist';
import Player from '../components/Player';
import SearchResult from "../components/SearchResult";
import NowPlaying from "../components/NowPlaying";
import Playlists from "../components/PlayLists";
import ArtistList from "../components/ArtistList";

import PlayListsSave from "../components/PlayListsSave";

const CurrentSection = () => {
  const [{ refreshing }, dispatch] = useContext(GlobalContext);

  const circularLoader = (
    <Grid
      style={{ height: "100vh" }}
      container
      justify="center"
      alignItems="center"
    >
      <CircularProgress />
    </Grid>
  );

  const setSongList = useCallback(
    data => {
      dispatch({ type: "setSongList", songs: data });
    },
    [dispatch]
  );

  const setPlaylists = useCallback(
    data => {
      dispatch({ type: "setPlaylists", playlists: data });
    },
    [dispatch]
  );

  const setRefreshing = useCallback(
    data => {
      dispatch({ type: "setRefreshing", refreshing: data });
    },
    [dispatch]
  );

  useEffect(() => {
    console.log("Refreshing: " + refreshing);
    if (refreshing) {
      console.log("Loading playlists and songs from s3");
      fetchPlaylists().then(playlists => {
        setPlaylists(playlists);
      });
      listSongs().then(songs => {
        setSongList(songs);
      });
      setRefreshing(false);  
    }
  }, [refreshing, setPlaylists, setRefreshing, setSongList]);


  // the set tab value will keep the tab active on their route
  // there are 4 tabs so there will be 3 indexes
  return (
    <div>
      <Suspense fallback={circularLoader}>
        <div>
          <div style={{maxHeight: 350, overflow: 'auto'}}>
          <SearchResult />
          <NowPlaying />
          <Playlists />
          <ArtistList />
          <PlayListsSave />
        </div>
        <Player />
        </div>
      </Suspense>
    </div>
  );
};

export default CurrentSection;
