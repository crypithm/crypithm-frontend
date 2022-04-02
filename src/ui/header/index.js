import React from "react";
import "./index.css";
import {AiOutlineMenu} from 'react-icons/ai'

export class Header extends React.Component {
  menuClick = () =>{
    console.log("a")
  }
  render() {
    return (
      <>
        <div className="header">
          <div className="menuBtn" onClick={()=>this.menuClick()}>
          <AiOutlineMenu />
          </div>
          <input type="text" placeholder="Search File, Folder"></input>{" "}
        </div>
      </>
    );
  }
}
