import React, { Component } from 'react'
import {MenuList, MenuItem, MenuButton } from 'react-menu-list';
import './PlayLists.css';
import { savePlaylist } from '../playlist.js'

class PlayLists extends Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <>
        <MenuButton className="playlist-btn"
          menu={
            <div className="playlist-list">
              <MenuList className="menu-item">
                  {
                    this.props.playlists.map((list, i) => {
                      return <MenuItem key={i} className="playlist-btn" onItemChosen={() => {
                        this.props.handlePlaylistClick(i)
                      }} value={i}>{list}</MenuItem>
                    })
                  }
                  <hr />
                  <div className="playlist-btn">New playlist: <input value={this.state.value} onChange={this.handleChange} type="text" />
                  <button className="playlist-btn" onClick={() => {
                    savePlaylist(this.state.value, '');
                    this.setState({value: ''});
                  }}>Save</button></div>
              </MenuList>
            </div>
          }
        >Playlists
        </MenuButton>
        
      </>
    );
  }
}

export default PlayLists;