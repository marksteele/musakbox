import React, { useContext, useState, useEffect, useRef } from "react";
import { fetchSongUrl }  from '../songs.js';
import { GlobalContext } from "./GlobalState";
import './Player.css'


const Player = () => {

  const [{ nowPlaying }, dispatch] = useContext(GlobalContext);
  const [{currentSong}] = useContext(GlobalContext);
  const [isMuted, setIsMuted] = useState(0);
  const [isLooping, setIsLooping] = useState(0);
  const [isShuffle, setIsShuffle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSongUrl, setCurrentSongUrl] = useState("");
  const playerRef = useRef();

  useEffect(() => {
    playerRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      if (interval) {
        clearInterval(interval);
      }
    } else {
      interval = setInterval(() => {
        setCurrentTime(playerRef.current ? playerRef.current.currentTime : 0);
      },1000)
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong.key !== undefined) {
      fetchSongUrl(currentSong.key)
      .then(url => {
        setCurrentSongUrl(url);
      });
      setIsPlaying(true);
    }
  }, [currentSong]);

  const songEnded = () => {
    if (!isLooping) {
      playNext();
    } else {
      playerRef.current.currentTime = 0;
      playerRef.current.play();
    }
  }

  const canPlay = () => {
    setDuration(playerRef.current.duration);
  }

  const playPrev = () => {
    if (nowPlaying.length > 0) {
      const idx = nowPlaying.findIndex(x => x.key === currentSong.key) || 0;
      dispatch({type: "setCurrentSong", song: nowPlaying[idx>0 ? idx-1 : nowPlaying.length-1]});  
    }
  };

  const playNext = () => {
    if (nowPlaying.length > 0) {
      if (!isShuffle) {
        const idx = nowPlaying.findIndex(x => x.key === currentSong.key) || 0;
        if (idx+1 !== nowPlaying.length) {
          dispatch({type: "setCurrentSong", song: nowPlaying[((idx+1) < nowPlaying.length+1) ? idx+1 : 0]});
        }
      } else {
        dispatch({type: "setCurrentSong", song: nowPlaying[Math.floor(Math.random()*nowPlaying.length)]});
      }
    }
  };

  const onSeek = (value) => {
    setCurrentTime(value);
    playerRef.current.currentTime = value;
  }

  const onPlay = () => {
    setIsPlaying(true);
    setupMediaSessions();
  }

  const onPause = () => {
    setIsPlaying(false);
  }

  const setupMediaSessions = () => {
    if ("mediaSession" in navigator) {
      console.log("navigator setupped");
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist
      });
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("IN PLAY");
        playerRef.current.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("IN PAUSE");
        playerRef.current.pause();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        playPrev();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNext();
      });
    }
  };
  
  
  return (
      <>
      <div className="player-controls">
      <div>
          <div className="time">{convertSecondsToMinsSecs(currentTime)}</div>
          <input className='slider' type="range" min="0" step="1" max={duration} value={currentTime} onChange={(e) => onSeek(e.target.value)}/>
          <div className="time">{convertSecondsToMinsSecs(duration)}</div>
          <div className="song-title">{currentSong.title}</div>
        </div>
        <div className="icons-container">
          <i className={isLooping ? "material-icons repeat glow" : "material-icons repeat"} onClick={() => setIsLooping(!isLooping)}>repeat_one</i>
          <i className={isShuffle ? "material-icons shuffle glow" : "material-icons shuffle"} onClick={() => setIsShuffle(!isShuffle)}>shuffle</i>
          <i className="material-icons" onClick={() => playPrev()}>skip_previous</i>
          <i className="material-icons play" onClick={() => {isPlaying ? playerRef.current.pause() : playerRef.current.play() }}>{isPlaying ? "pause_circle_outline" : "play_circle_outline"}</i>
          <i className="material-icons" onClick={() => playNext()}>skip_next</i>
          <i className="material-icons volume" onClick={() => setIsMuted(!isMuted)}>{isMuted ? "volume_off" : "volume_up"}</i>
        </div>
        <audio src={currentSongUrl} ref={playerRef} muted={isMuted} onPause={() => onPause()} onPlay={() => onPlay()} onCanPlay={() => canPlay()} onEnded={() => songEnded()} autoPlay={isPlaying}>Your browser does not support the <code>audio</code> element.</audio>
      </div>

      </>
    );
  }


export default Player;

function convertSecondsToMinsSecs(totalSec) {
  if (!totalSec) {
    return '00:00';
  }
  const minutes = parseInt( totalSec / 60, 10) % 60;
  const seconds = parseInt(totalSec % 60, 10);
  const result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
  return result;
}