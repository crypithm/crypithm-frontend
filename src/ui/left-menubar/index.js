import React from "react";
import { getFolders } from "../../lib/crypto/decrypt";
import { FcFolder } from "react-icons/fc";
import { AiFillFolder, AiFillLock, AiOutlinePaperClip } from "react-icons/ai";
import { RiArrowDownSFill } from "react-icons/ri";
import { menus } from "../../vars.js";
import "./index.css";

class RecursiveFolders extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dropped: [] };
  }

  componentDidMount = () => {
    var arr = [];
    for (var i = 0; i < this.state.dropped.length; i++) {
      arr.push(false);
    }
  };
  toggleDrop = (index) => {
    this.state.dropped[index] = this.state.dropped[index] ? false : true;
    this.setState({ dropped: this.state.dropped });
  };
  findFolderFromId = (id) => {
    var foundList = [];
    for (var i = 0; i < this.props.folders.length; i++) {
      if (this.props.folders[i].Parent == id) {
        foundList.push(this.props.folders[i]);
      }
    }
    return foundList;
  };

  render() {
    var lst = this.findFolderFromId(this.props.id);
    return lst.map((elem, index) => {
      return (
        <div className="lmenuFolderPre" key={index}>
          <div className="lmenuFolderBtn">
            <span onClick={() => this.props.setDirectory(elem.Id)}>
              <div className="lmenuFolderico">
                <FcFolder />
              </div>
              <p
                style={{
                  color: this.props.currentDir == elem.Id ? "#fff" : "",
                }}
              >
                {elem.Name}
              </p>
            </span>
            <div
              className="da-btnico"
              onClick={() => this.toggleDrop(index)}
              style={{
                transform: this.state.dropped[index]
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            >
              <RiArrowDownSFill />
            </div>
          </div>
          {this.state.dropped[index] ? (
            <div className="childDropDown">
              <RecursiveFolders
                id={elem.Id}
                folders={this.props.folders}
                setDirectory={(id) => this.props.setDirectory(id)}
                currentDir={this.props.currentDir}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    });
  }
}
export class Leftmenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ActiveMenuIndex: 0, fileBtnExtended: false, folders: [] };
  }

  componentDidMount = async () => {
    this.refreshIndex();
    this.setState({ folders: await getFolders(localStorage.getItem("key")) });
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
  extendFiles = async () => {
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
              <RecursiveFolders
                id={"/ 0"}
                folders={this.state.folders}
                setDirectory={(id) => this.props.setDirectory(id)}
                currentDir={this.props.currentDir}
              />
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
