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
    this.mouseOn = false;
    this.state = { dropped: [], onWhere: "" };
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

  mouseEnteredOnFolder = (id) => {
    if (this.props.selectedIds.length > 0) {
      if (this.props.selectedIds.indexOf(id) == -1) {
        this.setState({ onWhere: id });
      }
    }

    this.mouseOn = true;
  };

  findElemIndex = (id, returnFullObj) => {
    for (var i = 0; i < this.props.data.length; i++) {
      if (this.props.data[i].id == id) {
        if (returnFullObj) {
          return this.props.data[i];
        } else {
          return i;
        }
      }
    }
    return -1;
  };

  mouseReleased = async (onId) => {
    var target = onId;
    var idList = this.props.selectedIds;
    if (this.mouseOn && this.props.selectedIds.length > 0) {
      if (idList.indexOf(target) == -1) {
        this.setState({ onFolderId: "" });
        var newForm = new FormData();
        newForm.append("targetObjs", JSON.stringify(idList));
        newForm.append("target", target);
        newForm.append("action", "move");
        var resp = await fetch(`https://crypithm.com/api/folder`, {
          headers: {
            Authorization: localStorage.getItem("tk"),
          },
          method: "POST",
          body: newForm,
        });
        var jsn = await resp.json();
        if (jsn.StatusMessage == "Success") {
          var q = [];
          for (var i = 0; i < idList.length; i++) {
            let index = this.findElemIndex(idList[i]);
            var elem = this.props.data[index];
            elem.dir = target;
            this.props.spliceFromData(index, 1);
            q.push(elem);
          }
          this.props.setData(this.props.data.concat(q));
          this.setState({ selectedIndex: [] });
          this.props.refreshFolders();
        }
      }
    }
  };

  mouseLeftOnFolder = () => {
    this.mouseOn = false;
    this.setState({ onWhere: "" });
  };
  render() {
    var lst = this.findFolderFromId(this.props.id);
    return lst.map((elem, index) => {
      return (
        <div className="lmenuFolderPre" key={index}>
          <div
            className="lmenuFolderBtn"
            style={{
              color: this.props.currentDir == elem.Id ? "#fff" : "",
              border: this.state.onWhere == elem.Id ? "solid 1px #fff" : "",
            }}
            onClick={() => this.props.setDirectory(elem.Id)}
            onMouseEnter={() => this.mouseEnteredOnFolder(elem.Id)}
            onMouseLeave={this.mouseLeftOnFolder}
            onMouseUp={() => this.mouseReleased(elem.Id)}
          >
            <span>
              <div className="lmenuFolderico">
                <FcFolder />
              </div>
              <p>{elem.Name}</p>
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
                selectedIds={this.props.selectedIds}
                setData={(data) => this.props.setData(data)}
                data={this.props.data}
                spliceFromData={(strt, fnsh) =>
                  this.props.spliceFromData(strt, fnsh)
                }
                refreshFolders={() => this.props.refreshFolders()}
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

  refreshFolders = async () => {
    this.setState({ folders: await getFolders(localStorage.getItem("key")) });
  };
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
    if (n == 0) {
      this.props.setDirectory("/ 0");
    }
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
    this.setState({ folders: await getFolders(localStorage.getItem("key")) });
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
                selectedIds={this.props.selectedIds}
                setData={(data) => this.props.setData(data)}
                data={this.props.data}
                spliceFromData={(strt, fnsh) =>
                  this.props.spliceFromData(strt, fnsh)
                }
                refreshFolders={() => this.refreshFolders()}
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
