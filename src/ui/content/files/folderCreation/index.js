import React from "react";
import "./index.css";
import {
  encryptBlob,
  importAndDeriveKeyFromRaw,
} from "../../../../lib/crypto/encrypt";
import { encode } from "base64-arraybuffer";
import { CreateFolder } from "../../../../lib/crypto/encrypt";

export class Foldercreation extends React.Component {
  constructor(props) {
    super(props);
    this.inputVal = React.createRef();
  }
  unMount = () => {
    this.props.root.unmount();
  };

  create = async () => {
    const dir = localStorage.getItem("dir")
    let rtn = await CreateFolder(this.inputVal.current.value, dir)
    if (rtn) {
      var dec = new TextDecoder();
      var obj = {
        type: "folder",
        name: this.inputVal.current.value,
        id: rtn,
        dir: dir,
      };
      this.props.appendToView(obj);
      this.props.refreshFolder();
    }
  };
  render = () => {
    return (
      <>
        <div className="background-svg" onClick={this.unMount}></div>
        <div className="folderCreationArea">
          <div className="title">
            <p>Folder Creation</p>
          </div>
          <div className="body">
            <div className="nameInput">
              Name
              <input
                type="text"
                placeholder="Folder Name"
                ref={this.inputVal}
              ></input>
            </div>
            <div className="buttons">
              <div className="creationBtn" onClick={this.unMount}>
                Cancel
              </div>
              <div
                className="creationBtn"
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  color: "#000",
                }}
                onClick={() => this.create()}
              >
                Create
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
}
