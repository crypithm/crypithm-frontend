import React from "react";
import "./index.css";

export class Files extends React.Component {
  constructor(props) {
    super(props);
    this.clickDetectionArea = React.createRef();
    this.state = { selectedIndex: [] };
  }
  render() {
    var selectedStyle = { backgroundColor: "rgba(255,255,255,0.1)" };
    return (
      <>
        <div className="fileControlOptions"></div>
        <div style={{ height: "100vh" }} ref={this.clickDetectionArea}>
          <div
            className="fileContainer"
            style={
              this.state.selectedIndex.indexOf(1) != -1 ? selectedStyle : {}
            }
            objectid="89shHGfdasg"
            index={1}
          >
            a
          </div>
          <div
            className="fileContainer"
            style={
              this.state.selectedIndex.indexOf(2) != -1 ? selectedStyle : {}
            }
            objectid="8HBF579hfc"
            index={2}
          >
            a
          </div>
          <div
            className="fileContainer"
            style={
              this.state.selectedIndex.indexOf(3) != -1 ? selectedStyle : {}
            }
            objectid="8Gvxzjaskdu"
            index={3}
          >
            a
          </div>
        </div>
      </>
    );
  }

  getIdFromIndex(index) {
    return document.querySelector(`[index="${index}"]`).getAttribute("objectid")
  }

  componentDidMount() {
    this.clickDetectionArea.current.addEventListener("click", (e) => {
      var targetIndex = parseInt(e.target.getAttribute("index"));
      if (targetIndex == "") {
        this.setState({ selectedIndex: [] });
      } else {
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
  }
}
