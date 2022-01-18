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

  componentDidMount() {
    this.refreshIndex();
  }
  componentDidUpdate(prevProps) {
    if (this.props.currentPage !== prevProps.currentPage) {
      this.refreshIndex();
    }
  }

  LeftMenuButtonClicked(n) {
    this.setState({ ActiveMenuIndex: n });
    if (this.props.currentPage != menus[n]) {
      window.history.pushState({}, "", `/${menus[n]}`);
    }
    this.props.updateFunc();
  }

  refreshIndex() {
    this.setState({
      ActiveMenuIndex:
        menus.indexOf(this.props.currentPage) !== -1
          ? menus.indexOf(this.props.currentPage)
          : 0,
    });
  }
  render() {
    var ActivatedMenuStyle = {
      fontWeight: "bold",
      color: "rgba(255,255,255,0.7)",
    };
    return (
      <>
        <div className="leftmenu">
          <div className="logo">
            <Logo width={30} opacity={0.3} color={"#fff"} />
            <b>Crypithm Cloud</b>
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
            <b>Welcome Home, Developer</b>
            <div className="progressArea">
              <progress max="90" value="80"></progress>
              <b>8GB out of 10GB used</b>
            </div>
          </div>
        </div>
      </>
    );
  }
}
