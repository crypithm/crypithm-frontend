import {
  RiDeleteBin7Fill,
  RiPencilFill,
  RiInformationFill,
  RiFolderAddFill,
  RiFolderUploadFill,
  RiFileUploadFill,
  RiLayoutGridFill,
  RiLayoutBottomFill,
  RiArrowDownSFill,
  RiArrowUpLine,
  RiArrowDropRightLine,
} from "react-icons/ri";

import { FcFolder } from "react-icons/fc";
import { BsCloudPlusFill } from "react-icons/bs";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { FileInfo } from "./fileInfo/index.js";
import { ContextMenu } from "./contextMenu/index.js";
import { encryptAndUploadFile } from "../../../lib/crypto/encrypt.js";
import { randString } from "../../../lib/crypto/random";
import { getAllFiledata } from "../../../lib/crypto/decrypt";
import { Foldercreation } from "./folderCreation";

export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.dragDetectionArea = React.createRef();
    this.fileItemsRef = [];
    this.dragBoxRef = React.createRef();
    this.fileInputBox = React.createRef();
    this.state = {
      selectedIds : [],
      selectedIndex: [],
      moveFileBoxPos: [0, 0],
      onFolder: "",
      startPos: [0, 0],
      currentPos: [0, 0],
      newDropdown: true,
      ascending: false,
      Aligngrid: false,
      data: [],
      stalkedDirectory: [],
      uploadsInProgress: {},
      currentDirectory: "/ 0",
    };
  }

  pushToQueue = async (id, name, dir) => {
    this.setState({
      data: this.state.data.concat({ id: id, name: name, dir: dir }),
    });
    this.state.uploadsInProgress[id] = [0, 0];
    this.setState({ uploadsInProgress: this.state.uploadsInProgress });
  };
  changedUploadProgress = async (progress, speed, id) => {
    this.state.uploadsInProgress[id] = [progress, speed];
    this.setState({ uploadsInProgress: this.state.uploadsInProgress });
  };
  componentDidMount = async () => {
    this.clickDetectionArea.current.addEventListener(
      "mousedown",
      this.mouseDown
    );
    var decryptedJsonarray = await getAllFiledata(localStorage.getItem("key"));
    this.setState({ data: decryptedJsonarray });
  };

  FileInfo = () => {
    const root = ReactDOM.createRoot(
      document.querySelector("#fileInfoWillCome")
    );
    root.render(<FileInfo root={root} />);
  };
  ctxMenuCalled = (ctxMenuEvent) => {
    ctxMenuEvent.preventDefault();
    const root = ReactDOM.createRoot(
      document.querySelector("#ctxMenuWillCome")
    );
    root.render(
      <ContextMenu
        x={ctxMenuEvent.clientX}
        y={ctxMenuEvent.clientY}
        root={root}
      />
    );
  };
  alignBySomething = (byindex) => {
    if (byindex == 1) {
      if (this.state.ascending) {
        this.setState({
          data: this.state.data.sort((a, b) => {
            return a.name.localeCompare(b.name);
          }),
        });
      } else {
        this.setState({
          data: this.state.data.sort((a, b) => {
            return b.name.localeCompare(a.name);
          }),
        });
      }
      this.setState({ ascending: this.state.ascending ? false : true });
    }
  };
  changedAlign = () => {
    this.setState({ Aligngrid: this.state.Aligngrid == true ? false : true });
  };

  findElemIndex = (id, returnFullObj) => {
    for (var i = 0; i < this.state.data.length; i++) {
      if (this.state.data[i].id == id) {
        if (returnFullObj) {
          return this.state.data[i];
        } else {
          return i;
        }
      }
    }
    return -1;
  };

  uploadDone = async (id) => {
    let index = this.findElemIndex(id);
    var elem = this.state.data[index];
    elem.completed = true;
    this.state.data.splice(index, 1);
    this.appendToView(elem);
  };
  appendToView = (elem) => {
    this.setState({ data: this.state.data.concat(elem) });
  };
  startUpload = async () => {
    var currentDir = localStorage.getItem("dir");
    var clientKey = localStorage.getItem("key");
    var files = this.fileInputBox.current.files;
    var current = 0;
    var idList = [];
    for (var b = 0; b < files.length; b++) {
      var currentId = randString(11);
      this.changedUploadProgress(0, 0, currentId);
      await this.pushToQueue(currentId, files[b].name, currentDir);
      idList[b] = currentId;
    }
    var loopFiles = async (leftover) => {
      var v = leftover > 4 ? 4 : leftover;
      for (var i = 0; i < v; i++) {
        await encryptAndUploadFile(
          files[current],
          clientKey,
          this.changedUploadProgress,
          idList[current],
          this.uploadDone,
          currentDir
        );
        current += 1;
      }
      if (current < files.length) {
        loopFiles(files.length - current);
      }
    };
    loopFiles(files.length);
    current = 0;
  };

  showFileCreation = () => {
    const root = ReactDOM.createRoot(
      document.querySelector("#folderCreationWillCome")
    );
    root.render(
      <Foldercreation
        root={root}
        appendToView={(elem) => this.appendToView(elem)}
      />
    );
  };

  moveToDir = (id) => {
    this.setState({ selectedIndex: [] });
    this.setState({ stalkedDirectory: [] });
    this.setState({ currentDirectory: id });
    localStorage.setItem("dir", id);
    if (id != "/ 0") {
      var tempArr = [];
      const v = (id) => {
        var targetObj = this.findElemIndex(id, true);
        tempArr.unshift({
          id: targetObj.id,
          name: targetObj.name,
        });
        if (targetObj.dir != "/ 0") {
          v(targetObj.dir);
        } else {
          this.setState({
            stalkedDirectory: tempArr,
          });
        }
      };
      v(id);
    }
  };
  render = () => {
    var selectedStyle = { backgroundColor: "rgba(255,255,255,0.1)" };

    return (
      <>
        <div
          ref={this.dragDetectionArea}
          onContextMenu={(e) => this.ctxMenuCalled(e)}
        >
          <div className="dragger" style={{display:this.state.moveFileBoxPos[0]==0?"none":"flex", top: this.state.moveFileBoxPos[1]+5+"px", left: this.state.moveFileBoxPos[0]+5+"px"}}>
          <p>
          {this.findElemIndex(this.state.selectedIds[0],true).name}
          </p>
          {this.state.selectedIds.length>1?
            <div className="howManyselected">{this.state.selectedIds.length}</div>:<></>
          }
          </div>
          <div id="ctxMenuWillCome"></div>
          <div id="fileInfoWillCome"></div>
          <div id="folderCreationWillCome"></div>
          <div
            className="dragSquare"
            style={{
              top:
                this.state.currentPos[1] - this.state.startPos[1] > 0
                  ? this.state.startPos[1]
                  : this.state.currentPos[1],

              left:
                this.state.currentPos[0] - this.state.startPos[0] > 0
                  ? this.state.startPos[0]
                  : this.state.currentPos[0],
              width: Math.abs(
                this.state.currentPos[0] - this.state.startPos[0]
              ),
              height: Math.abs(
                this.state.currentPos[1] - this.state.startPos[1]
              ),
            }}
            ref={this.dragBoxRef}
          ></div>
          <div className="fileControlOptions">
            <b className="Newbtn" onClick={() => this.newBtnClicked()}>
              <div className="Newbtn-icon">
                <BsCloudPlusFill />
              </div>
              New
            </b>
            <b className="viewStyle" onClick={() => this.changedAlign()}>
              {this.state.Aligngrid ? (
                <RiLayoutGridFill />
              ) : (
                <RiLayoutBottomFill />
              )}
            </b>
            <div
              className={
                this.state.newDropdown
                  ? "newDropdown"
                  : "newDropdown dropDownShow"
              }
            >
              <div
                className="dropdown-buttonIcon"
                onClick={() => this.showFileCreation()}
              >
                <RiFolderAddFill />{" "}
              </div>
              <div className="dropdown-buttonIcon">
                <RiFolderUploadFill />{" "}
              </div>
              <input
                type="file"
                ref={this.fileInputBox}
                style={{ display: "none" }}
                id="fileInput"
                onChange={() => this.startUpload()}
                multiple
              ></input>
              <label className="dropdown-buttonIcon" htmlFor="fileInput">
                <RiFileUploadFill />{" "}
              </label>
            </div>
            <div
              className={
                this.state.selectedIndex.length === 0
                  ? "FCObtn hidden"
                  : "FCObtn"
              }
            >
              <b className="howManySelected">
                selected {this.state.selectedIndex.length} file(s)
              </b>{" "}
              <b
                className="unselectButton"
                onClick={() => {
                  this.setState({ selectedIndex: [] });
                }}
              >
                unselect
              </b>
              <div className="FileOptButtons">
                <div
                  className={
                    this.state.selectedIndex.length !== 1
                      ? "FileOptIcons hidden"
                      : "FileOptIcons"
                  }
                  onClick={() => this.FileInfo()}
                >
                  <RiInformationFill />
                </div>
                <div className="FileOptIcons">
                  <RiDeleteBin7Fill />
                </div>
                <div className="FileOptIcons">
                  <RiPencilFill />
                </div>
              </div>
            </div>
          </div>
          <div
            className="arrangeBar"
            style={{ display: this.state.Aligngrid ? "none" : "" }}
          >
            <b onClick={() => this.alignBySomething(1)}>
              Name
              <RiArrowDownSFill
                style={{
                  transform: this.state.ascending
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
                  transition: "all 0.1s linear",
                }}
              />
            </b>
          </div>
          <div
            ref={this.clickDetectionArea}
            className={
              this.state.Aligngrid
                ? "filecont-cont displayGrid"
                : "filecont-cont"
            }
          >
            {this.state.data.filter(elem=>elem.dir==this.state.currentDirectory).map((elem, index) => {

                if (elem.type == "folder") {
                  return (
                    <div
                      className={
                        this.state.Aligngrid
                          ? "fileContainer grid"
                          : "fileContainer"
                      }
                      onMouseUp={()=>this.moveFilesToDir(this.state.selectedIds, elem.id)}
                      style={
                        this.state.selectedIndex.indexOf(index + 1) != -1
                          ? selectedStyle
                          : {}
                      }
                      objectid={elem.id}
                      key={elem.id}
                      data-index={index + 1}
                      ref={(ref) => {
                        this.fileItemsRef[index] = ref;
                        return true;
                      }}
                      onDoubleClick={() => this.moveToDir(elem.id)}
                    >
                      <div
                        className="fileThumbnail"
                        style={{
                          fontSize: this.state.Aligngrid ? "40pt" : "20pt",
                        }}
                      >
                        <FcFolder />
                      </div>
                      <p
                        className="elemName"
                        onMouseDown={() => this.moveToDir(elem.id)}
                      >
                        {elem.name}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div
                      className={
                        this.state.Aligngrid
                          ? "fileContainer grid"
                          : "fileContainer"
                      }
                      style={
                        this.state.selectedIndex.indexOf(index + 1) != -1
                          ? selectedStyle
                          : {}
                      }
                      objectid={elem.id}
                      key={elem.id}
                      data-index={index + 1}
                      ref={(ref) => {
                        this.fileItemsRef[index] = ref;
                        return true;
                      }}
                    >
                      {elem.completed ? (
                        <>
                          <div className="fileThumbnail">
                            <img src={elem.thumb} width={20} />
                          </div>
                          <p className="elemName">{elem.name}</p>
                        </>
                      ) : (
                        <>
                          <progress
                            className="uploadingProgress"
                            max="100"
                            value={this.state.uploadsInProgress[elem.id][0]}
                          ></progress>
                          <p className="fileName">{`${elem.name}`}</p>
                          {`${this.state.uploadsInProgress[elem.id][1]}MB/s`}
                          <RiArrowUpLine />
                        </>
                      )}
                    </div>
                  );
                }
            })}
          </div>
          <div className="directory">
            <b className="directoryBtn" onClick={() => this.moveToDir("/ 0")}>
              Crypithm
            </b>
            {this.state.stalkedDirectory.map((elem, index) => {
              return (
                <span key={index}>
                  <RiArrowDropRightLine />
                  <b
                    className="directoryBtn"
                    onClick={() => this.moveToDir(elem.id)}
                  >
                    {elem.name}
                  </b>
                </span>
              );
            })}
          </div>
        </div>
      </>
    );
  };
  moveFilesToDir=async(idList, target)=>{
    if(idList.indexOf(target)==-1){
      console.log("moved",idList, "to", target)
      var newForm = new FormData()
      newForm.append("targetObjs", JSON.stringify(idList))
      newForm.append("target", target)
      newForm.append("action","move")
      var resp = await fetch(`https://crypithm.com/api/folder`,{
        headers : {
          'Authorization': localStorage.getItem("tk")
        },
        method: "POST",
        body: newForm
      })
      var jsn = await resp.json()
      if(jsn.StatusMessage== "Success"){
        var q=[]
        for(var i=0;i<idList.length;i++){
          let index = this.findElemIndex(idList[i]);
          var elem = this.state.data[index];
          elem.dir = target;
          this.state.data.splice(index, 1);
          q.push(elem)
        }
        this.setState({ data: this.state.data.concat(q) });
        this.setState({selectedIndex:[]})
      }
    }
  }

  newBtnClicked = () => {
    this.setState({ newDropdown: this.state.newDropdown ? false : true });
  };
  getIdFromIndex = (index) => {
    return document
      .querySelector(`[data-index="${index}"]`)
      .getAttribute("objectid");
  };

  mouseDown = (e) => {
    this.setState({ startPos: [0, 0], currentPos: [0, 0] });
    var targetIndex = e.target.getAttribute("data-index");
    //dragsquare
    if (this.state.selectedIndex.indexOf(parseInt(targetIndex)) != -1) {
      
      this.state.selectedIndex.map((elem, _) => {
        this.state.selectedIds.unshift(this.getIdFromIndex(elem))
        this.setState({selectedIds: this.state.selectedIds})
        this.dragDetectionArea.current.addEventListener(
          "mousemove",
          this.moveElems
        );
        window.addEventListener("mouseup", () => {
          if (this.dragDetectionArea.current) {
            this.dragDetectionArea.current.removeEventListener(
              "mousemove",
              this.moveElems
            );
          }
          this.setState({selectedIds:[]});
          this.setState({moveFileBoxPos:[0,0]})
        });
      });
    } else {
      this.setState({ startPos: [e.pageX, e.pageY] });
      this.mouseMove(e);
      this.dragDetectionArea.current.addEventListener(
        "mousemove",
        this.mouseMove
      );
      window.addEventListener("mouseup", () => {
        if (this.dragDetectionArea.current) {
          this.dragDetectionArea.current.removeEventListener(
            "mousemove",
            this.mouseMove
          );
          this.setState({ startPos: [0, 0], currentPos: [0, 0] });
        }
      });
      this.setState({ selectedIndex: [] });
      targetIndex = parseInt(targetIndex);
      //click,shift,ctrl
      if (e.shiftKey) {
        if (this.state.selectedIndex.length == 0) {
          this.setState({
            selectedIndex: this.state.selectedIndex.concat([targetIndex]),
          });
        } else {
          var intlist = [];
          if (this.state.selectedIndex.at(0) - targetIndex < 0) {
            for (
              var i = this.state.selectedIndex.at(0);
              i <= targetIndex;
              i++
            ) {
              intlist.push(i);
            }
          } else {
            for (
              var i = this.state.selectedIndex.at(0);
              i >= targetIndex;
              i--
            ) {
              intlist.push(i);
            }
          }
          this.setState({ selectedIndex: intlist });
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (this.state.selectedIndex.indexOf(targetIndex) == -1) {
          this.setState({
            selectedIndex: this.state.selectedIndex.concat([targetIndex]),
          });
        } else {
          var index = this.state.selectedIndex.indexOf(targetIndex);
          if (index > -1) {
            this.state.selectedIndex.splice(index, 1);
            this.setState({ selectedIndex: this.state.selectedIndex });
          }
        }
      } else if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        this.setState({ selectedIndex: [] });
        if (targetIndex) {
          this.setState({
            selectedIndex: [targetIndex],
          });
        }
      }
    }
  };

  moveElems = (mouseMoveEvent) => {
    this.setState({
      moveFileBoxPos: [mouseMoveEvent.pageX, mouseMoveEvent.pageY],
    });
  };
  mouseMove = (mouseMoveEvent) => {
    var a = this.dragBoxRef.current.getBoundingClientRect();
    this.fileItemsRef.map((elem, _) => {
      if (elem != null) {
        var b = elem.getBoundingClientRect();
        if (
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top &&
          this.state.currentPos[1] != 0 &&
          this.state.currentPos[0] != 0
        ) {
          if (
            this.state.selectedIndex.indexOf(
              parseInt(elem.getAttribute("data-index"))
            ) == -1
          ) {
            this.setState({
              selectedIndex: this.state.selectedIndex.concat([
                parseInt(elem.getAttribute("data-index")),
              ]),
            });
          }
        }
      }
    });
    this.setState({
      currentPos: [mouseMoveEvent.pageX, mouseMoveEvent.pageY],
    });
  };
}
