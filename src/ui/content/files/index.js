import {
  RiDeleteBin7Fill,
  RiPencilFill,
  RiInformationFill,
} from "react-icons/ri";
import React from "react";
import "./index.css";

export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.dragDetectionArea = React.createRef();
    this.fileItemsRef = [];
    this.state = {
      selectedIndex: [],
      startPos: [0, 0],
      currentPos: [0, 0],
      idList: [],
    };
    this.data = [
      {
        id: "89shHGfdasg",
        name: "TusisCool.mpeg",
        size: 1209121,
        date: "2022 1 19",
        thumb:
          "https://pbs.twimg.com/profile_images/1342768807891378178/8le-DzgC_400x400.jpg",
      },
      {
        id: "8HBF579hfcX",
        name: "crypithm.jpeg",
        size: 2048,
        date: "2022 1 19",
        thumb:
          "https://i1.sndcdn.com/avatars-zUGIpyyW010rJFrc-rdl0PQ-t240x240.jpg",
      },
      {
        id: "8Hd7s6d5xFs",
        name: "uarenoov.png",
        size: 5048,
        date: "2022 1 19",
        thumb:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROtpHcuUX6rkfh8MpUbLNxJch5a_sXlLoOU6rlsVLzla0NpyEPD7PChbhElWNJz2O8djY&usqp=CAU",
      },
    ];
  }

  componentDidMount = () => {
    this.clickDetectionArea.current.addEventListener(
      "mousedown",
      this.mouseDown
    );
  };

  render = () => {
    var selectedStyle = { backgroundColor: "rgba(255,255,255,0.1)" };

    return (
      <div ref={this.dragDetectionArea}>
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
        ></div>
        <div
          className={
            this.state.selectedIndex.length === 0
              ? "fileControlOptions hidden"
              : "fileControlOptions"
          }
        >
          <b>selected {this.state.selectedIndex.length} file(s)</b>
          <div className="FileOptButtons">
            <div
              className={
                this.state.selectedIndex.length !== 1
                  ? "FileOptIcons hidden"
                  : "FileOptIcons"
              }
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
        <div style={{ height: "100vh" }} ref={this.clickDetectionArea}>
          {this.data.map((elem, index) => {
            return (
              <div
                className="fileContainer"
                style={
                  this.state.selectedIndex.indexOf(index + 1) != -1
                    ? selectedStyle
                    : {}
                }
                objectid={elem.id}
                key={elem.id}
                data-index={index + 1}
                ref={(ref) => { this.fileItemsRef[index] = ref; return true; }}
              >
                <div className="fileThumbnail">
                  <img src={elem.thumb} width={20} />
                </div>

                {elem.name}
              </div>
            );
          })}
        </div>
      </div>
    );
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
      this.setState({ startPos: [e.clientX, e.clientY] });
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
      if (e.ctrlKey) {
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
      if (!e.shiftKey && !e.ctrlKey) {
        this.setState({ selectedIndex: [] });
        this.setState({
          selectedIndex: this.state.selectedIndex.concat([targetIndex]),
        });
      }
    }
  };

  mouseMove = (mouseMoveEvent) => {
    this.setState({
      currentPos: [mouseMoveEvent.clientX, mouseMoveEvent.clientY],
    });

    if (mouseMoveEvent.target.getAttribute("data-index")) {
      if (
        this.state.selectedIndex.indexOf(
          parseInt(mouseMoveEvent.target.getAttribute("data-index"))
        ) == -1
      ) {
        this.setState({
          selectedIndex: this.state.selectedIndex.concat([
            parseInt(mouseMoveEvent.target.getAttribute("data-index")),
          ]),
        });
      }
    }
  };
}
