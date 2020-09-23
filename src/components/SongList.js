import React, { Component } from 'react';
import './SongList.css';
import {MenuList, MenuItem, MenuButton } from 'react-menu-list';
import { savePlaylist } from '../playlist.js'

class SongList extends Component {

  render() {
    return (
      <div className="songs-list">
        {
         this.props.songs.map((song, i) => {
            return <div className={parseInt(this.props.currentSongNumber, 10) === i ? "song-list-item glow" : "song-list-item"}>
                    <div
                      key={i}
                      id={i}
                      onClick={(e) => this.props.handleSongClick(e.target.id)}>
                      {song.artist} - {song.title}
                    </div>
                    <MenuButton className="menu-item"
                        menu={
                          <div className="menu-item">
                            <MenuList className="menu-item">
                                {
                                  this.props.playlists.map(list => {
                                    return <MenuItem key={list} className="menu-item" onItemChosen={() => {
                                      savePlaylist(list, song.key);
                                    }} value={list}>{list}</MenuItem>
                                  })
                                }
                            </MenuList>
                          </div>
                        }
                      >Add to playlist
                      </MenuButton>
                    </div>
          })
        }
      </div>
    );
  }
}

export default SongList;