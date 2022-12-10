import React from "react";
import "./index.css";
import { shareFile } from "../../../../lib/crypto/share";
import { decryptBlob } from "../../../../lib/crypto/decrypt";
import { importAndDeriveKeyFromRaw } from "../../../../lib/crypto/encrypt";
import { decode } from "base64-arraybuffer";
export class SharePrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentPage: 1, isLoaded: false, link: "", isCopied: false };
    this.displayUserName = false;
    this.fileProps = {};
    this.displayUserRef = React.createRef();
  }
  componentDidMount = async () => {
    console.log(this.props.name);
    var form = new FormData();
    form.append("id", this.props.id);
    var resp = await fetch(`https://crypithm.com/api/share`, {
      headers: {
        Authorization: localStorage.getItem("tk"),
      },
      method: "POST",
      body: form,
    });
    this.setState({ isLoaded: true });
    var fjson = await resp.json();
    if (fjson.Message == "Create") {
      this.fileProps = { SharedId: fjson.Id, Tk: fjson.Token, Key: fjson.Key };
    } else if (fjson.Message == "Success") {
      this.setPage(2);
      var Ab = decode(fjson.Link);
      var key = await importAndDeriveKeyFromRaw(
        localStorage.getItem("key"),
        Ab.slice(16, 32)
      );
      var dec = new TextDecoder();
      this.setState({
        link:
          "https://s.crypithm.com/" +
          dec.decode(await decryptBlob(key, Ab.slice(0, 16), Ab.slice(32))),
      });
    }
  };
  copyText = () => {
    navigator.clipboard.writeText(this.state.link);
    this.setState({ isCopied: true });
    setTimeout(() => {
      this.setState({ isCopied: false });
    }, 1000);
  };
  unMount = () => {
    this.props.root.unmount();
  };

  setPage = (pn) => {
    this.setState({ currentPage: pn });
  };
  genLink = async () => {
    var checked = this.displayUserRef.current.checked;
    this.setState({
      link: await shareFile(
        this.fileProps.SharedId,
        this.fileProps.Key,
        this.fileProps.Tk,
        checked,
        this.props.name
      ),
    });
    this.setPage(2);
  };
  checkboxChanged = () => {
    this.displayUserName = this.displayUserName ? false : true;
  };
  render = () => {
    if (!this.state.isLoaded) {
      return <></>;
    }
    return (
      <>
        {this.state.currentPage == 1 ? (
          <>
            <div className="background-svg" onClick={this.unMount}></div>
            <div className="share-prompt">
              <div className="title">Configure Sharing Options</div>
              <div className="body">
                <div className="option">
                  <input
                    type="checkbox"
                    onChange={this.checkboxChanged}
                    ref={this.displayUserRef}
                  />
                  <div className="exp">
                    <p className="title">Display My Username</p>
                    <p className="desc">Display My Username </p>
                    <div className="display-name-ctn">
                      My Username:{" "}
                      <div className="display-name">{window.User}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="btns">
                <div className="cancel-btn" onClick={this.unMount}>
                  Cancel
                </div>
                <div className="share-btn" onClick={this.genLink}>
                  Create Link
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="background-svg" onClick={this.unMount}></div>
            <div className="share-prompt">
              <div className="title">Share</div>
              <div className="body">
                <textarea
                  className="link-area"
                  readOnly
                  rows="1"
                  defaultValue={this.state.link}
                ></textarea>
                <div className="btns">
                  <div className="cancel-btn" onClick={this.unMount}>
                    Cancel
                  </div>
                  <div className="share-btn" onClick={this.copyText}>
                    {this.state.isCopied ? <>Copied!</> : <>Copy</>}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };
}
