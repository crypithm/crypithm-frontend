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
  RiEmotionSadLine,
  RiShareFill,
} from "react-icons/ri";
import { FcFolder } from "react-icons/fc";
import { BsCloudPlusFill } from "react-icons/bs";

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { FileInfo } from "./fileInfo/index.js";
import { ContextMenu } from "./contextMenu/index.js";
import {
  encryptAndUploadFile,
  CreateFolder,
} from "../../../lib/crypto/encrypt.js";
import { randString } from "../../../lib/crypto/random";
import { Foldercreation } from "./folderCreation";
import { filesWithoutThumb, unindexed } from "../../../vars";
import { SharePrompt } from "./shareFile";
import { AiOutlineCloseCircle } from "react-icons/ai";

class Nofiles extends React.Component {
  render() {
    return (
      <div className="noFiles">
        {this.props.loader ? (
          <>
            <b>Loading</b>
          </>
        ) : (
          <>
            <div className="emojiArea">
              <RiEmotionSadLine />
            </div>
            <h3>Nothing Here</h3>
            <b>You can upload using the -New- button above</b>
          </>
        )}
      </div>
    );
  }
}
export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.fileItemsRef = [];
    this.dragBoxRef = React.createRef();
    this.nameChangeInput = React.createRef();
    this.nameEditingFile = "";
    this.previousUpload = 0;
    this.state = {
      onFolderId: "",
      selectedIndex: [],
      moveFileBoxPos: [0, 0],
      onFolder: "",
      startPos: [0, 0],
      currentPos: [0, 0],
      newDropdown: true,
      ascending: false,
      Sizeascending: false,
      Aligngrid: false,
      stalkedDirectory: [],
      uploadsInProgress: {},
    };
  }

  /**
   *
   * @param {string} id target id - random length 16 string
   * @param {string} name name - name of file - unencrypted
   * @param {string} dir target directory
   * @param {number} size size of file
   * @return {void}
   */

  pushToQueue = async (id, name, dir, size) => {
    this.props.pushToUpData(id, name, dir, size);
    this.state.uploadsInProgress[id] = [0, 0];
    this.setState({ uploadsInProgress: this.state.uploadsInProgress });
  };

  /**
   *
   * @param {number} updatedLength updated length of uploading bytes
   * @param {*} speed current upload speed in Mb/s
   * @param {*} id update target id
   * @param {*} fs target file size
   * @return {void}
   */

  changedUploadProgress = async (updatedLength, speed, id, fs) => {
    this.previousUpload += updatedLength;
    var progress = (this.previousUpload / fs) * 100;
    if (this.previousUpload / fs >= 1) {
      this.previousUpload = 0;
    }
    this.state.uploadsInProgress[id] = [progress, speed];
    this.setState({ uploadsInProgress: this.state.uploadsInProgress });
  };
  componentDidMount = async () => {
    this.clickDetectionArea.current.addEventListener(
      "mousedown",
      this.mouseDown
    );
    var keyPressed = false;
    window.addEventListener("keydown", (e) => {
      if (e.code === "MetaLeft" || e.code === "ControlLeft") {
        keyPressed = true;
      }
      if (e.code === "KeyZ" && keyPressed === true) {
        console.log("ctrl-z");
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "MetaLeft" || e.code === "ControlLeft") {
        keyPressed = false;
      }
    });
  };

  FileInfo = () => {
    const root = ReactDOM.createRoot(
      document.querySelector("#fileInfoWillCome")
    );
    root.render(<FileInfo root={root} />);
  };

  /**
   *
   * @param {event} ctxMenuEvent ctx menu event
   */

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
  /**
   *
   * @param {number} byindex aligning index(1~3)
   */
  alignBySomething = (byindex) => {
    if (byindex === 1) {
      if (this.state.ascending) {
        this.props.setData(
          this.props.data.sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
        );
      } else {
        this.props.setData(
          this.props.data.sort((a, b) => {
            return b.name.localeCompare(a.name);
          })
        );
      }
      this.setState({ ascending: this.state.ascending ? false : true });
    } else if (byindex === 2) {
      if (this.state.Sizeascending) {
        this.props.setData(
          this.props.data.sort((a, b) => {
            return a.size - b.size;
          })
        );
      } else {
        this.props.setData(
          this.props.data.sort((a, b) => {
            return b.size - a.size;
          })
        );
      }
      this.setState({ Sizeascending: this.state.Sizeascending ? false : true });
    }
  };
  changedAlign = () => {
    this.setState({ Aligngrid: this.state.Aligngrid === true ? false : true });
  };

  /**
   * find certain element from full data
   * @param {string} id id of target
   * @param {boolean} returnFullObj
   * @returns {(number,object)} object of target if returnFullObj==true else index of target
   */

  findElemIndex = (id, returnFullObj) => {
    for (var i = 0; i < this.props.data.length; i++) {
      if (this.props.data[i].id === id) {
        if (returnFullObj) {
          return this.props.data[i];
        } else {
          return i;
        }
      }
    }
    return -1;
  };

  /**
   * wrap up upload at interface
   * @param {string} id target
   */

  uploadDone = (id) => {
    let index = this.findElemIndex(id);
    var elem = this.props.data[index];
    elem.completed = true;
    this.props.data.splice(index, 1);
    this.appendToView(elem);
  };

  /**
   *
   * @param {object} elem
   */

  appendToView = (elem) => {
    this.props.setData(this.props.data.concat(elem));
  };
  startUpload = async (files, isDirectoryUploading, folderArr) => {
    let currentDir = localStorage.getItem("dir");
    var clientKey = localStorage.getItem("key");
    var current = 0;
    var idList = [];
    for (var b = 0; b < files.length; b++) {
      var currentId = randString(11);
      this.changedUploadProgress(0, 0, currentId);
      if (isDirectoryUploading) {
        currentDir = folderArr.find(
          (elem) =>
            elem.name ===
            files[b].webkitRelativePath.split("/")[
              files[b].webkitRelativePath.split("/").length - 2
            ]
        ).id;
      }
      await this.pushToQueue(
        currentId,
        files[b].name,
        currentDir,
        files[b].size
      );
      idList[b] = currentId;
    }
    var loopFiles = async (leftover) => {
      var v = leftover > 4 ? 4 : leftover;
      for (var i = 0; i < v; i++) {
        if (isDirectoryUploading) {
          currentDir = folderArr.find(
            (elem) =>
              elem.name ===
              files[current].webkitRelativePath.split("/")[
                files[current].webkitRelativePath.split("/").length - 2
              ]
          ).id;
        }
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

  filesUpload = async (e) => {
    await this.startUpload(e.target.files, false);
  };

  folderUpload = async (e) => {
    var files = e.target.files;
    var folderTarg = [];
    for (var i = 0; i < files.length; i++) {
      var fileItem = files[i].webkitRelativePath.split("/");
      for (var v = 0; v < fileItem.length - 1; v++) {
        if (
          folderTarg.find(
            (elem) => elem.name === fileItem[v] && elem.idx === v
          ) === undefined
        ) {
          var parent =
            v === 0
              ? localStorage.getItem("dir")
              : folderTarg.find((elem) => elem.name === fileItem[v - 1]).id;
          var id = await CreateFolder(fileItem[v], parent);
          folderTarg.push({ name: fileItem[v], idx: v, id: id });
          var obj = {
            type: "folder",
            name: fileItem[v],
            id: id,
            dir: parent,
          };
          console.log(obj);
          this.appendToView(obj);
          await this.props.refreshFolder();
        }
      }

      //await CreateFolder(fileItem[0])
    }
    await this.startUpload(files, true, folderTarg);
  };

  showFileCreation = () => {
    const root = ReactDOM.createRoot(
      document.querySelector("#folderCreationWillCome")
    );
    root.render(
      <Foldercreation
        root={root}
        appendToView={(elem) => this.appendToView(elem)}
        refreshFolder={() => this.props.refreshFolder()}
      />
    );
  };

  componentDidUpdate(prevProps) {
    if (this.props.dir !== prevProps.dir) {
      if (this.props.dir !== "/ 0") {
        var tempArr = [];
        const v = (id) => {
          var targetObj = this.findElemIndex(id, true);
          if (targetObj === -1) {
            console.error("unidentifiable target index");
          } else {
            tempArr.unshift({
              id: targetObj.id,
              name: targetObj.name,
            });
            if (targetObj.dir !== "/ 0") {
              v(targetObj.dir);
            } else {
              this.setState({
                stalkedDirectory: tempArr,
              });
            }
          }
        };
        v(this.props.dir);
      } else {
        this.setState({
          stalkedDirectory: [],
        });
      }
    }
  }
  moveToDir = (id) => {
    if (id !== this.props.dir) {
      this.setState({ selectedIndex: [] });
      this.setState({ stalkedDirectory: [] });
      this.props.setDirectory(id);
    }
  };

  addPrefixToSize = (length) => {
    var fs;
    if (1024 >= length) {
      fs = Math.round(length * 10) / 10 + "B";
    } else if (length > 1024 && length < 1024 * 1024) {
      fs = Math.round((length / 1024) * 10) / 10 + "KB";
    } else if (length >= 1024 * 1024 && length < 1024 * 1024 * 1024) {
      fs = Math.round((length / (1024 * 1024)) * 10) / 10 + "MB";
    } else if (
      length >= 1024 * 1024 * 1024 &&
      length < 1024 * 1024 * 1024 * 1024
    ) {
      fs = Math.round((length / (1024 * 1024 * 1024)) * 10) / 10 + "GB";
    }
    return fs;
  };

  changeElemName = () => {
    var selectedId = this.getIdFromIndex(this.state.selectedIndex);
    var indexFromFull = this.findElemIndex(selectedId);
    this.props.modifyData(indexFromFull, "isNameEditing", true);
    this.nameEditingFile = indexFromFull;
  };
  shareFile = () => {
    if (this.state.selectedIndex.length == 1) {
      var selectedId = this.getIdFromIndex(this.state.selectedIndex);
      const root = ReactDOM.createRoot(
        document.querySelector("#shareWillCome")
      );
      root.render(
        <SharePrompt
          name={this.findElemIndex(selectedId, true).name}
          id={selectedId}
          root={root}
        />
      );
    } else {
      console.log("a");
    }
  };
  applyNameChangeIfKey = (keyCode, id) => {
    if (keyCode === "Enter") {
      var willChangeTo = this.nameChangeInput.current.value;
      var indexFromFull = this.findElemIndex(id);
      this.props.modifyData(indexFromFull, "isNameEditing", false);
      this.props.modifyData(indexFromFull, "name", willChangeTo);
    } else if (keyCode === "Escape") {
      indexFromFull = this.findElemIndex(id);
      this.props.modifyData(indexFromFull, "isNameEditing", false);
    }
    this.nameEditingFile = "";
  };
  render = () => {
    return (
      <>
        <div onContextMenu={(e) => this.ctxMenuCalled(e)}>
          <div
            className="dragger"
            style={{
              display: this.state.moveFileBoxPos[0] === 0 ? "none" : "flex",
              top: this.state.moveFileBoxPos[1] + 5 + "px",
              left: this.state.moveFileBoxPos[0] + 5 + "px",
            }}
          >
            <p>{this.findElemIndex(this.props.selectedIds[0], true).name}</p>
            {this.props.selectedIds.length > 1 ? (
              <div
                className="howManyselected"
                style={{
                  backgroundColor:
                    this.state.onFolderId === "" ? "#949494" : "#fff",
                }}
              >
                {this.props.selectedIds.length}
              </div>
            ) : (
              <></>
            )}
          </div>
          <div id="ctxMenuWillCome"></div>
          <div id="fileInfoWillCome"></div>
          <div id="shareWillCome"></div>
          <div id="folderCreationWillCome"></div>
          <div
            className="dragSquare"
            style={{
              display:
                this.state.currentPos[0] - this.state.startPos[0] !== 0 ||
                this.state.currentPos[1] - this.state.startPos[1] !== 0
                  ? "block"
                  : "none",
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
                <RiFolderAddFill />
                {"Folder"}
              </div>
              <input
                type="file"
                style={{ display: "none" }}
                id="folderInput"
                onChange={this.folderUpload}
                webkitdirectory=""
                directory=""
                mozdirectory=""
              ></input>

              <label className="dropdown-buttonIcon" htmlFor="folderInput">
                <RiFolderUploadFill />
                {"Folder"}
              </label>
              <input
                type="file"
                style={{ display: "none" }}
                id="fileInput"
                onChange={this.filesUpload}
                multiple
              ></input>
              <label className="dropdown-buttonIcon" htmlFor="fileInput">
                <RiFileUploadFill />
                {"File"}
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
                selected {this.state.selectedIndex.length} item(s)
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
                <div
                  className={
                    this.state.selectedIndex.length !== 1
                      ? "FileOptIcons hidden"
                      : "FileOptIcons"
                  }
                  onClick={() => this.changeElemName()}
                >
                  <RiPencilFill />
                </div>
                <div
                  className={
                    this.state.selectedIndex.length == 1
                      ? "FileOptIcons"
                      : "FileOptIcons hidden"
                  }
                  onClick={() => this.shareFile()}
                >
                  <RiShareFill />
                </div>
                <div className="FileOptIcons">
                  <RiDeleteBin7Fill />
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
            <b onClick={() => this.alignBySomething(2)}>
              Size
              <RiArrowDownSFill
                style={{
                  transform: this.state.Sizeascending
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
            {this.props.data.length === 0 ? (
              this.props.isLoading ? (
                <>
                  <Nofiles loader={true} />
                </>
              ) : (
                <>
                  <Nofiles loader={false} />
                </>
              )
            ) : this.props.data.filter((elem) => elem.dir === this.props.dir)
                .length === 0 ? (
              <Nofiles loader={false} />
            ) : (
              this.props.data
                .filter((elem) => elem.dir === this.props.dir)
                .map((elem, index) => {
                  if (elem.type === "folder") {
                    return (
                      <div
                        className={
                          this.state.Aligngrid
                            ? "fileContainer grid"
                            : "fileContainer"
                        }
                        onMouseUp={() =>
                          this.moveFilesToDir(this.props.selectedIds, elem.id)
                        }
                        onMouseEnter={() =>
                          this.folderEnterLeave(true, elem.id)
                        }
                        onMouseLeave={() =>
                          this.folderEnterLeave(false, elem.id)
                        }
                        onClick={() => {
                          if (window.innerWidth <= 800) {
                            this.moveToDir(elem.id);
                          }
                        }}
                        style={{
                          backgroundColor:
                            this.state.selectedIndex.indexOf(index + 1) !== -1
                              ? "rgba(255,255,255,0.1)"
                              : "",
                          border:
                            this.state.onFolderId === elem.id
                              ? "solid 1px rgba(255,255,255,0.6)"
                              : "",
                        }}
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
                        {elem.isNameEditing ? (
                          <>
                            <input
                              type="text"
                              autoFocus
                              defaultValue={elem.name}
                              onKeyDown={(e) =>
                                this.applyNameChangeIfKey(e.code, elem.id)
                              }
                              ref={this.nameChangeInput}
                              className="nameChangeInput"
                              id="inputBoxId"
                              spellCheck={false}
                            ></input>
                          </>
                        ) : (
                          <>
                            <p className="elemName">{elem.name}</p>
                          </>
                        )}
                        <p className="elemSize">-</p>
                      </div>
                    );
                  } else {
                    var fileFormat;
                    try {
                      fileFormat = /\.[^.\\/:*?"<>|\r\n]+$/
                        .exec(elem.name)[0]
                        .split(".")[1];
                    } catch {
                      fileFormat = "";
                    }

                    return (
                      <div
                        onDoubleClick={() =>
                          this.props.viewFile(elem.id, elem.name)
                        }
                        onClick={() => {
                          if (window.innerWidth <= 800) {
                            this.props.viewFile(elem.id, elem.name);
                          }
                        }}
                        className={
                          this.state.Aligngrid
                            ? "fileContainer grid"
                            : "fileContainer"
                        }
                        style={{
                          backgroundColor:
                            this.state.selectedIndex.indexOf(index + 1) !== -1
                              ? "rgba(255,255,255,0.1)"
                              : "",
                        }}
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
                            <div
                              className="fileThumbnail"
                              style={{
                                fontSize: this.state.Aligngrid
                                  ? "30pt"
                                  : "15pt",
                                backgroundColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {filesWithoutThumb[fileFormat]
                                ? filesWithoutThumb[fileFormat]
                                : unindexed}
                            </div>
                            {elem.isNameEditing ? (
                              <>
                                <input
                                  type="text"
                                  autoFocus
                                  defaultValue={elem.name}
                                  onKeyDown={(e) =>
                                    this.applyNameChangeIfKey(e.code, elem.id)
                                  }
                                  ref={this.nameChangeInput}
                                  className="nameChangeInput"
                                  id="inputBoxId"
                                  spellCheck={false}
                                ></input>
                              </>
                            ) : (
                              <>
                                <p className="elemName">{elem.name}</p>
                              </>
                            )}
                            <p className="elemSize">
                              {this.addPrefixToSize(elem.size)}
                            </p>
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
                })
            )}
          </div>
          <div className="directory">
            <b
              className="directoryBtn"
              onClick={() => this.moveToDir("/ 0")}
              onMouseUp={() => this.MoveToBtmDir("/ 0")}
            >
              Crypithm
            </b>
            {this.state.stalkedDirectory.map((elem, index) => {
              return (
                <span key={index}>
                  <RiArrowDropRightLine />
                  <b
                    className="directoryBtn"
                    onClick={() => this.moveToDir(elem.id)}
                    onMouseUp={() => this.MoveToBtmDir(elem.id)}
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

  MoveToBtmDir = (id) => {
    if (localStorage.getItem("dir") !== id) {
      this.setState({ onFolderId: id });
      this.moveFilesToDir(this.props.selectedIds, id);
    }
  };
  folderEnterLeave = (enter, target) => {
    if (this.props.selectedIds.length > 0) {
      if (this.props.selectedIds.indexOf(target) === -1) {
        if (enter) {
          this.setState({ onFolderId: target });
        } else {
          this.setState({ onFolderId: "" });
        }
      }
    }
  };
  moveFilesToDir = async (idList, target) => {
    if (this.state.onFolderId !== "") {
      await this.props.moveFtoD(idList, target);
      this.setState({ selectedIndex: [] });
      this.setState({ onFolderId: "" });
    }
  };

  newBtnClicked = () => {
    this.setState({ newDropdown: this.state.newDropdown ? false : true });
  };
  getIdFromIndex = (index) => {
    return document
      .querySelector(`[data-index="${index}"]`)
      .getAttribute("objectid");
  };

  mouseDown = (e) => {
    if (window.innerWidth > 800) {
      var tempIdArr = [];
      this.setState({ startPos: [0, 0], currentPos: [0, 0] });
      var targetIndex = parseInt(e.target.getAttribute("data-index"));
      if (this.nameEditingFile !== "" && e.target.id !== "inputBoxId") {
        this.props.modifyData(this.nameEditingFile, "isNameEditing", false);
        this.nameEditingFile = "";
      }
      //dragsquare
      if (e.shiftKey) {
        if (this.state.selectedIndex.length === 0) {
          this.setState({
            selectedIndex: [targetIndex],
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
            for (i = this.state.selectedIndex.at(0); i >= targetIndex; i--) {
              intlist.push(i);
            }
          }
          this.setState({ selectedIndex: intlist });
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (this.state.selectedIndex.indexOf(targetIndex) === -1) {
          this.setState({
            selectedIndex: this.state.selectedIndex.concat(targetIndex),
          });
        } else {
          var index = this.state.selectedIndex.indexOf(targetIndex);
          this.state.selectedIndex.splice(index, 1);
          this.setState({ selectedIndex: this.state.selectedIndex });
        }
      } else {
        if (this.state.selectedIndex.indexOf(targetIndex) !== -1) {
          this.state.selectedIndex.forEach((elem, _) => {
            tempIdArr.unshift(this.getIdFromIndex(elem));
            //click,shift,ctrl
            this.props.dragDetectionArea.current.addEventListener(
              "mousemove",
              this.moveElems
            );
            window.addEventListener("mouseup", () => {
              if (this.props.dragDetectionArea.current) {
                this.props.dragDetectionArea.current.removeEventListener(
                  "mousemove",
                  this.moveElems
                );
              }

              this.props.setSelected([]);
              this.setState({ moveFileBoxPos: [0, 0] });
            });
          });
          this.props.setSelected(tempIdArr);
        } else {
          if (!isNaN(targetIndex)) {
            this.setState({
              selectedIndex: [parseInt(targetIndex)],
            });
          } else {
            this.setState({ selectedIndex: [] });
          }
          this.setState({ startPos: [e.pageX, e.pageY] });
          this.mouseMove(e);
          this.props.dragDetectionArea.current.addEventListener(
            "mousemove",
            this.mouseMove
          );
          window.addEventListener("mouseup", () => {
            if (this.props.dragDetectionArea.current) {
              this.props.dragDetectionArea.current.removeEventListener(
                "mousemove",
                this.mouseMove
              );
              this.setState({ startPos: [0, 0], currentPos: [0, 0] });
            }
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
    this.fileItemsRef.forEach((elem, _) => {
      if (elem != null) {
        var b = elem.getBoundingClientRect();
        if (
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top &&
          this.state.currentPos[1] !== 0 &&
          this.state.currentPos[0] !== 0
        ) {
          if (
            this.state.selectedIndex.indexOf(
              parseInt(elem.getAttribute("data-index"))
            ) === -1
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
