import React from "react";
import { Logo } from "../../icons/Logo";
import { AiFillFolder, AiFillLock, AiOutlinePaperClip } from "react-icons/ai";
import { menus } from "../../vars.js";
import "./index.css";

export class Leftmenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ActiveMenuIndex: 0 };
  }

  componentDidMount = () => {
    this.refreshIndex();
  };
  componentDidUpdate = (prevProps) => {
    if (this.props.currentPage !== prevProps.currentPage) {
      this.refreshIndex();
    }
  };

  LeftMenuButtonClicked = (n) => {
    this.setState({ ActiveMenuIndex: n });
    if (this.props.currentPage != menus[n]) {
      window.history.pushState({}, "", `/${menus[n]}`);
    }
    this.props.updateFunc();
  };
  refreshIndex = () => {
    this.setState({
      ActiveMenuIndex:
        menus.indexOf(this.props.currentPage) !== -1
          ? menus.indexOf(this.props.currentPage)
          : 0,
    });
  };
  render = () => {
    var ActivatedMenuStyle = {
      fontWeight: "bold",
      color: "rgba(255,255,255,1)",
    };
    
    return (
      <>
        <div className={`leftmenu ${this.props.ismobileMenuOpen?"open":""}`}>
          <div className="logo">
            <Logo width={25} opacity={0.3} color={"#fff"} />
            <b>crypithm cloud</b>
          </div>
          <div className="buttonArea">
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 0 ? ActivatedMenuStyle : {}}
              onClick={() => this.LeftMenuButtonClicked(0)}
            >
              <div className="buttonIcon">
                <AiFillFolder />
              </div>{" "}
              <b>All Files</b>
            </div>
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 1 ? ActivatedMenuStyle : {}}
              onClick={() => this.LeftMenuButtonClicked(1)}
            >
              <div className="buttonIcon">
                <AiFillLock />
              </div>{" "}
              <b>Vault</b>
            </div>
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 2 ? ActivatedMenuStyle : {}}
              onClick={() => this.LeftMenuButtonClicked(2)}
            >
              <div className="buttonIcon">
                <AiOutlinePaperClip />
              </div>{" "}
              <b>Links</b>
            </div>
          </div>
          <div className="userInfoArea">
            <div className="progressArea">
            <b>8GB out of 10GB used</b>
              <progress max="90" value="80"></progress>
            </div>
          </div>
          <div className="btmLeftOver">
            Privacy Policy | Terms Of Service
          </div>
        </div>
      </>
    );
  };
}
