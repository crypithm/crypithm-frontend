import React from "react";
import { AiFillFolder, AiFillLock, AiOutlinePaperClip } from "react-icons/ai";
import { RiArrowDownSFill } from "react-icons/ri";
import { menus } from "../../vars.js";
import "./index.css";

export class Leftmenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ActiveMenuIndex: 0, fileBtnExtended: false };
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
  extendFiles = () => {
    this.setState({
      fileBtnExtended: this.state.fileBtnExtended ? false : true,
    });
  };
  render = () => {
    var ActivatedMenuStyle = {
      fontWeight: "bold",
      color: "#fff",
    };

    return (
      <>
        <div
          className={`leftmenu ${this.props.ismobileMenuOpen ? "open" : ""}`}
        >
          <div className="buttonArea">
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 0 ? ActivatedMenuStyle : {}}
            >
              <div
                className="icoBtn"
                onClick={() => this.LeftMenuButtonClicked(0)}
              >
                <div className="buttonIcon">
                  <AiFillFolder />
                </div>{" "}
                <b>All Files</b>
              </div>
              <div
                className="da-btnico"
                onClick={() => this.extendFiles()}
                style={{
                  transform: this.state.fileBtnExtended ? "rotate(180deg)" : "",
                }}
              >
                <RiArrowDownSFill />
              </div>
            </div>
            <div
              className={`folderExtended ${
                this.state.fileBtnExtended ? "show" : ""
              }`}
            >
              
            </div>
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 1 ? ActivatedMenuStyle : {}}
              onClick={() => this.LeftMenuButtonClicked(1)}
            >
              <div className="icoBtn">
                <div className="buttonIcon">
                  <AiFillLock />
                </div>{" "}
                <b>Vault</b>
              </div>
            </div>
            <div
              className="button"
              style={this.state.ActiveMenuIndex === 2 ? ActivatedMenuStyle : {}}
              onClick={() => this.LeftMenuButtonClicked(2)}
            >
              <div className="icoBtn">
                <div className="buttonIcon">
                  <AiOutlinePaperClip />
                </div>{" "}
                <b>Links</b>
              </div>
            </div>
          </div>
          <div className="userInfoArea">
            <div className="progressArea">
              <b>8GB out of 10GB used</b>
              <progress max="90" value="80"></progress>
            </div>
          </div>
          <div className="btmLeftOver">
            &copy; Crypithm Cloud., All Rights Reserved
          </div>
        </div>
      </>
    );
  };
}
