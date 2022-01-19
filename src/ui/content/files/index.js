import React from "react";
import "./index.css";

export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.state = { selectedIndex: [], startPos: [0, 0], currentPos: [0, 0] };
  }
  render() {
    var selectedStyle = { backgroundColor: "rgba(255,255,255,0.1)" };
    return (
      <div ref={this.clickDetectionArea}>
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
            width:
              this.state.currentPos[0] - this.state.startPos[0] >= 0
                ? this.state.currentPos[0] - this.state.startPos[0]
                : (this.state.currentPos[0] - this.state.startPos[0]) * -1,
            height:
              this.state.currentPos[1] - this.state.startPos[1] >= 0
                ? this.state.currentPos[1] - this.state.startPos[1]
                : (this.state.currentPos[1] - this.state.startPos[1]) * -1,
          }}
        ></div>
        <div className="fileControlOptions"></div>
        <div style={{ height: "100vh" }}>
          {[
            "89shHGfdasg",
            "8HBF579hfcX",
            "8Gvxzjaskdu",
            "lW6PdOYPNCW",
            "1lNa9ADW58H",
            "7UdbAm8LGtm",
            "JTn0psPPtDs",
            "slCVk11xUV2",
            "rg2avRUQgpr",
          ].map((id, index) => {
            return (
              <div
                className="fileContainer"
                style={
                  this.state.selectedIndex.indexOf(index + 1) != -1
                    ? selectedStyle
                    : {}
                }
                objectid={id}
                key={id}
                data-index={index + 1}
              >
                a
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  getIdFromIndex = (index) => {
    return document
      .querySelector(`[data-index="${index}"]`)
      .getAttribute("objectid");
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

  componentDidMount = () => {
    this.clickDetectionArea.current.addEventListener("mousedown", (e) => {
      this.setState({ startPos: [0, 0], currentPos: [0, 0] });
      var targetIndex = e.target.getAttribute("data-index");
      if (targetIndex == null) {
        //dragsquare
        this.setState({ startPos: [e.clientX, e.clientY] });
        this.mouseMove(e)
        window.addEventListener("mousemove", this.mouseMove);
        window.addEventListener("mouseup", () => {
          window.removeEventListener("mousemove", this.mouseMove);
          this.setState({ startPos: [0, 0], currentPos: [0, 0] });
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
    });
  };
}
