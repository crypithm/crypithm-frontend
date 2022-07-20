import React from "react";
import "./index.css";
import {
  encryptBlob,
  importAndDeriveKeyFromRaw,
} from "../../../../lib/crypto/encrypt";
import { encode } from "base64-arraybuffer";

export class Foldercreation extends React.Component {
  constructor(props) {
    super(props);
    this.inputVal = React.createRef();
  }
  unMount = () => {
    this.props.root.unmount();
  };

  create = async () => {
    var folderNameAb = new TextEncoder().encode(this.inputVal.current.value);
    const clientKey = localStorage.getItem("key");
    var clientIV = crypto.getRandomValues(new Uint8Array(16));
    var keySalt = crypto.getRandomValues(new Uint8Array(16));
    let folderKey = await importAndDeriveKeyFromRaw(clientKey, keySalt);
    var encryptedFolderName = new Uint8Array(
      await encryptBlob(folderNameAb, folderKey, false, clientIV)
    );
    var blankSpaceForKey = new Uint8Array(encryptedFolderName.byteLength + 32);
    blankSpaceForKey.set(keySalt, 0);
    blankSpaceForKey.set(clientIV, 16);
    blankSpaceForKey.set(encryptedFolderName, 32);
    var form = new FormData();
    var currentDir = localStorage.getItem("dir");
    form.append("action", "create");
    form.append("curentdirindex", currentDir);
    form.append("name", encode(blankSpaceForKey));
    var resp = await fetch("https://crypithm.com/api/folder", {
      headers: {
        Authorization: localStorage.getItem("tk"),
      },
      method: "POST",
      body: form,
    });
    var jsn = await resp.json();
    if (jsn.StatusMessage == "Success") {
      var dec = new TextDecoder();
      var obj = {
        type: "folder",
        name: dec.decode(folderNameAb),
        id: jsn.Id,
        dir: currentDir,
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
