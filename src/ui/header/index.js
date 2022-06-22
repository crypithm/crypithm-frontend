import React from "react";
import "./index.css";
import {AiOutlineMenu} from 'react-icons/ai'
import { Logo } from "../../icons/Logo";
export class Header extends React.Component {

  render() {
    return (
      <>
        <div className="header">
        <div className="logo">
            <Logo width={25} opacity={0.3} color={"#fff"} />
            <b>crypithm cloud</b>
          </div>
          <div className="menuBtn" onClick={()=>this.props.mobileMenu()}>
          <AiOutlineMenu />
          </div>
          <input type="text" placeholder="Search File, Folder"></input>{" "}
        </div>
      </>
    );
  }
}
