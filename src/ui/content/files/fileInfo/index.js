import React from "react";
import "./index.css";
import { filesWithoutThumb, unindexed } from "../../../../vars";
import { FcFolder } from "react-icons/fc";
export class FileInfo extends React.Component {
  constructor(props) {
    super(props);
    this.data = this.props.datas;
    this.state = { fileFormat: "" };
  }
  componentDidMount = () => {
    try {
      this.setState({
        fileFormat: /\.[^.\\/:*?"<>|\r\n]+$/
          .exec(this.data.name)[0]
          .split(".")[1],
      });
    } catch (e) {}
  };
  unMount = () => {
    this.props.root.unmount();
  };
  render = () => {
    return (
      <>
        <div className="background-svg" onClick={() => this.unMount()}></div>
        <div className="centered-menu">
          <div className="thumbnail-img">
            {this.data.type !== "folder" ? (
              filesWithoutThumb[this.state.fileFormat] ? (
                filesWithoutThumb[this.state.fileFormat]
              ) : (
                unindexed
              )
            ) : (
              <FcFolder />
            )}
          </div>
          <div className="textArea">
            <div className="textboxArea name">
              <div className="textBold">Name:</div>
              <div className="textLight"> {this.data.name}</div>
            </div>
            <div className="textboxArea">
              <div className="textBold">Directory Id</div>
              <div className="textLight"> {this.data.dirId}</div>
            </div>
            <div className="textboxArea">
              <div className="textBold">Size:</div>
              <div className="textLight"> {this.data.size}</div>
            </div>
            <div className="textboxArea">
              <div className="textBold">Last Modified:</div>{" "}
              <div className="textLight"> {this.data.date}</div>
            </div>
          </div>
        </div>
      </>
    );
  };
}
