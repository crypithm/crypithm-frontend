import React from "react";
import "./index.css";
import { AiOutlineMenu } from "react-icons/ai";
import { Logo } from "../../icons/Logo";
import { SearchBar } from "./search";

export class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isuseropen: false };
  }

  clicked = () => {
    this.setState({ isuseropen: this.state.isuseropen ? false : true });
  };
  render() {
    return (
      <>
        <div className="header">
          <div className="logo">
            <Logo width={25} opacity={0.3} color={"#fff"} />
            <b>crypithm cloud</b>
          </div>
          <div className="menuBtn" onClick={() => this.props.mobileMenu()}>
            <AiOutlineMenu />
          </div>
          <SearchBar
            data={this.props.data}
            setDirectory={(id) => this.props.setDirectory(id)}
          />
          <div className="profile" onClick={this.clicked}>
            <img src={this.props.pfpsrc}></img>
          </div>
        </div>
        <div className={`user-area ${this.state.isuseropen ? "show" : ""}`}>
          <div className="profile">
            <img src={this.props.pfpsrc}></img>
            <div className="info-area">
              <p>{window.User}</p>
              <p className="sub">User</p>
            </div>
          </div>
          <div className="btm"></div>
        </div>
      </>
    );
  }
}
