import React, { Component } from 'react'
import {MenuList, MenuItem, MenuButton } from 'react-menu-list';
import './ArtistList.css';

class ArtistList extends Component {

  render() {
    return (
      <>
        <MenuButton className="artist-btn"
          menu={
            <div className="artist-list">
              <MenuList className="artist-btn">
                  {
                   this.props.artists.map((artist, i) => {
                      return <MenuItem key={i} className="artist-btn" onItemChosen={() => {
                        this.props.handleArtistClick(i)
                      }} value={i}>{artist}</MenuItem>
                    })
                  }
              </MenuList>
            </div>
          }
        >Artists
        </MenuButton>
      </>
    );
  }
}

export default ArtistList;