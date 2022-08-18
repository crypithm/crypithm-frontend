import React from "react";
import "./index.css";
import {AiOutlineSearch} from 'react-icons/ai'

export class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showExtend: false, extendMore:false };
  }
  startSearch = (e, prop) => {
    console.log(e.target.value);
    var s = this.props.data.filter((elem) =>
      new RegExp(e.target.value).test(elem[prop])
    );
    if(prop.length>0){
        console.log(s.map(elem=>elem.name));
    }
  };

  endSearch=()=>{
    this.setState({showExtend:false})
  }
  openSearch=()=>{
    this.setState({showExtend:true})
  }
  render() {
    return (
      <>
        <input
          type="text"
          placeholder="Search File, Folder"
          className="searchBar"
          onChange={(e) => this.startSearch(e, "name")}
          onBlur={this.endSearch}
          onFocus={this.openSearch}
        ></input>
        <div className={`searchResult ${this.state.showExtend?'show':''}`}>
            <div className="searchTitle">
                Search from
            </div>
        </div>
      </>
    );
  }
}
