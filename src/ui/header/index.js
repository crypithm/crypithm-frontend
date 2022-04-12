import React from "react";
import "./index.css";
import {AiOutlineMenu} from 'react-icons/ai'

export class Header extends React.Component {

  render() {
    return (
      <>
        <div className="header">
          <div className="menuBtn" onClick={()=>this.props.mobileMenu()}>
          <AiOutlineMenu />
          </div>
          <input type="text" placeholder="Search File, Folder"></input>{" "}
        </div>
      </>
    );
  }
}
