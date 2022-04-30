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
  RiArrowUpLine
} from "react-icons/ri";

import { BsCloudPlusFill } from "react-icons/bs";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { FileInfo } from "./fileInfo/index.js";
import { ContextMenu } from "./contextMenu/index.js";
import { encryptAndUploadFile } from "../../../lib/crypto/encrypt.js";
export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.dragDetectionArea = React.createRef();
    this.fileItemsRef = [];
    this.dragBoxRef = React.createRef();
    this.fileInputBox = React.createRef();
    this.state = {
      selectedIndex: [],
      startPos: [0, 0],
      currentPos: [0, 0],
      newDropdown: true,
      ascending: false,
      Aligngrid: false,
      data: [
        {
          id: "49shHGfdasg",
          name: "TusisCool.mpeg",
          size: 1209121,
          date: "2022 1 19",
          completed: true,
          thumb:
            "https://pbs.twimg.com/profile_images/1342768807891378178/8le-DzgC_400x400.jpg",
        },
        {
          id: "GxBF579hfcX",
          name: "crypithm.jpeg",
          size: 2048,
          date: "2022 1 19",
          completed: true,
          thumb:
            "https://i1.sndcdn.com/avatars-zUGIpyyW010rJFrc-rdl0PQ-t240x240.jpg",
        },
        {
          id: "8Hd7s6d5xFs",
          name: "uarenoov.png",
          size: 5048,
          date: "2022 1 19",
          completed: true,
          thumb:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROtpHcuUX6rkfh8MpUbLNxJch5a_sXlLoOU6rlsVLzla0NpyEPD7PChbhElWNJz2O8djY&usqp=CAU",
        },
        {
          id: "9HbGdtS5dckj",
          name: "uareverypro.png",
          completed: false,
        },
      ],
      uploadsInProgress: { "9HbGdtS5dckj": [80,1] }
    };
  }


  changedUploadProgress = (progress, speed, id)=>{
    this.state.uploadsInProgress[id]=[progress, speed]
    this.setState({uploadsInProgress: this.state.uploadsInProgress})
  }
  componentDidMount = () => {
    this.clickDetectionArea.current.addEventListener(
      "mousedown",
      this.mouseDown
    );
  };

  FileInfo = () => {
    ReactDOM.render(<FileInfo />, document.querySelector("#fileInfoWillCome"));
  };

  ctxMenuCalled = (ctxMenuEvent) => {
    ctxMenuEvent.preventDefault();

    ReactDOM.render(
      <ContextMenu x={ctxMenuEvent.clientX} y={ctxMenuEvent.clientY} />,
      document.querySelector("#ctxMenuWillCome")
    );

    window.addEventListener("click", () => {
      ReactDOM.unmountComponentAtNode(
        document.querySelector("#ctxMenuWillCome")
      );
    });
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

  startUpload = async () => {
    var clientKey = "a";
    var files = this.fileInputBox.current.files;
    var current = 0;
    var loopFiles = async(leftover) => {
      var v = leftover > 4 ? 4 : leftover;
      for (var i = 0; i < v; i++) {
        await encryptAndUploadFile(files[current], clientKey, this.changedUploadProgress);
        current += 1;
      }
      if (current < files.length) {
        loopFiles(files.length - current);
      }
    }
    loopFiles(files.length);
    current = 0;
  };
  render = () => {
    var selectedStyle = { backgroundColor: "rgba(255,255,255,0.1)" };

    return (
      <div
        ref={this.dragDetectionArea}
        onContextMenu={(e) => this.ctxMenuCalled(e)}
      >
        <div id="ctxMenuWillCome"></div>
        <div id="fileInfoWillCome"></div>
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
            width: Math.abs(this.state.currentPos[0] - this.state.startPos[0]),
            height: Math.abs(this.state.currentPos[1] - this.state.startPos[1]),
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
            <div className="dropdown-buttonIcon">
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
              this.state.selectedIndex.length === 0 ? "FCObtn hidden" : "FCObtn"
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
          style={{ height: "100vh" }}
          ref={this.clickDetectionArea}
          className={
            this.state.Aligngrid ? "filecont-cont displayGrid" : "filecont-cont"
          }
        >
          {this.state.data.map((elem, index) => {
            return (
              <div
                className={
                  this.state.Aligngrid ? "fileContainer grid" : "fileContainer"
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
                    {elem.name}
                  </>
                ) : (
                  <>
                    <progress
                      className="uploadingProgress"
                      max="100"
                      value={this.state.uploadsInProgress[elem.id][0]}
                    ></progress>
                    <p className="fileName">
                    {`${elem.name}`}                      
                    </p>
                    {`${this.state.uploadsInProgress[elem.id][1]}MB/s`}
                    <RiArrowUpLine />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
    this.setState({ startPos: [0, 0], currentPos: [0, 0] });
    var targetIndex = e.target.getAttribute("data-index");
    if (targetIndex == null) {
      //dragsquare
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
    } else {
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
      }
      if (e.ctrlKey || e.metaKey) {
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
      }
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        this.setState({ selectedIndex: [] });
        this.setState({
          selectedIndex: this.state.selectedIndex.concat([targetIndex]),
        });
      }
    }
  };

  mouseMove = (mouseMoveEvent) => {
    var a = this.dragBoxRef.current.getBoundingClientRect();
    this.fileItemsRef.map((elem, _) => {
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
    });
    this.setState({
      currentPos: [mouseMoveEvent.pageX, mouseMoveEvent.pageY],
    });
  };
}
