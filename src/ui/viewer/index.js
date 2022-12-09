import React from "react";
import "./index.css";
import { viewableType } from "../../vars";
import {
  RiArrowDropLeftLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiDownload2Line,
  RiPlayLine,
  RiPauseLine,
} from "react-icons/ri";
import { getFileBlob, getFileMime } from "../../lib/crypto/decrypt";

class ViewBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSize: [window.innerWidth * 0.85, ""],
      isFull: false,
      vidDuration: 0,
      playing: false,
      vidPos: 0,
      isVideoPosChanging: false,
    };
    this.imgRef = React.createRef();
    this.vidref = React.createRef();
    this.progressbarRef = React.createRef();
  }
  imgScaleChange = async (zoomin) => {
    if (!zoomin) {
      this.setState({ imgSize: [this.state.imgSize[0] * 0.75, ""] });
    } else {
      this.setState({ imgSize: [this.state.imgSize[0] * 1.25, ""] });
    }
  };

  setFullScreen = () => {
    if (!this.state.isFull) {
      this.setState({ imgSize: [window.innerWidth, ""], isFull: true });
      document.documentElement.requestFullscreen();
    } else {
      this.setState({ imgSize: [window.innerWidth * 0.85, ""], isFull: false });
      document.exitFullscreen();
    }
  };
  playPause = () => {
    if (this.state.playing) {
      this.setState({ playing: false });
      this.vidref.current.pause();
    } else {
      this.setState({ playing: true });
      this.vidref.current.play();
    }
  };
  videoStateChanged = () => {
    this.setState({
      vidPos:
        (this.vidref.current.currentTime / this.vidref.current.duration) * 100,
    });
  };
  changeVidProg = (e) => {
    if (this.state.isVideoPosChanging) {
      var clientPointerXPos = 0;
      if (e.type === "touchmove") {
        clientPointerXPos = e.touches[0].clientX;
      } else if (e.type === "mousemove") {
        clientPointerXPos = e.clientX;
      }
      try {
        this.vidref.current.currentTime =
          this.vidref.current.duration *
          ((clientPointerXPos -
            this.progressbarRef.current.getBoundingClientRect().left) /
            this.progressbarRef.current.clientWidth);
      } catch {
        //pass
      }
    }
  };
  render() {
    switch (this.props.fullMime.split("/")[0]) {
      case "image":
        return (
          <>
            <img
              src={this.props.src}
              width={this.state.imgSize[0]}
              height={this.state.imgSize[1]}
              ref={this.imgRef}
              className="viewerImage"
            />
            <div
              className="imgControl"
              style={{ display: this.props.showControls ? "" : "none" }}
            >
              <div className="focus">
                <div
                  className="eachBtn"
                  onClick={() => this.imgScaleChange(true)}
                >
                  <RiZoomInLine />
                </div>
                <div
                  className="eachBtn"
                  onClick={() => this.imgScaleChange(false)}
                >
                  <RiZoomOutLine />
                </div>
                <div className="eachBtn" onClick={this.setFullScreen}>
                  {this.state.isFull ? (
                    <RiFullscreenExitLine />
                  ) : (
                    <RiFullscreenLine />
                  )}
                </div>
              </div>
            </div>
          </>
        );
      case "video":
        return (
          <>
            <div className="vidElem">
              <video
                type={this.props.fullMime}
                controls={false}
                width={this.state.imgSize[0]}
                height={this.state.imgSize[1]}
                ref={this.vidref}
                onTimeUpdate={this.videoStateChanged}
                src={this.props.src}
              ></video>
              <div
                className="vidControlbar"
                style={{ display: this.props.showControls ? "" : "none" }}
              >
                <div className="playPause" onClick={this.playPause}>
                  {this.state.playing ? <RiPauseLine /> : <RiPlayLine />}
                </div>
                <div className="vidProgress">
                  <progress
                    className={this.state.isVideoPosChanging ? "moving" : ""}
                    onMouseDown={() => {
                      this.setState({ isVideoPosChanging: true });
                    }}
                    onTouchStart={() => {
                      this.setState({ isVideoPosChanging: true });
                    }}
                    onMouseUp={() => {
                      this.setState({ isVideoPosChanging: false });
                    }}
                    onTouchEnd={() => {
                      this.setState({ isVideoPosChanging: false });
                    }}
                    onMouseLeave={() => {
                      this.setState({ isVideoPosChanging: false });
                    }}
                    onTouchMove={this.changeVidProg}
                    onMouseMove={this.changeVidProg}
                    value={this.state.vidPos}
                    max={100}
                    ref={this.progressbarRef}
                  ></progress>
                </div>
                <div className="fullScreen" onClick={this.setFullScreen}>
                  {this.state.isFull ? (
                    <RiFullscreenExitLine />
                  ) : (
                    <RiFullscreenLine />
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  }
}

export class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceUrl: "",
      type: "",
      mime: "",
      showAddition: true,
      pctge: 0,
    };
  }

  updateLoading = (pctge) => {
    this.setState({ pctge: pctge });
  };

  updateVideoSource = (url) => {
    this.setState({ sourceUrl: url });
  };
  componentWillUnmount = () => {
    console.log("unmount");
  };
  componentDidMount = async () => {
    var mime = getFileMime(this.props.name);
    if (!mime) {
      mime = "application/octet-stream";
    }
    var blobSource;
    if (mime) {
      blobSource = await getFileBlob(this.props.id, mime, this.updateLoading);
    }

    var prevtoid = "";
    var tf = true;
    if (viewableType.indexOf(mime) === -1) {
      tf = false;
    }
    this.setState({ sourceUrl: blobSource, isViewable: tf, mime: mime });
    window.addEventListener("mousemove", () => {
      this.setState({ showAddition: true });
      clearTimeout(prevtoid);
      prevtoid = setTimeout(() => {
        this.setState({ showAddition: false });
      }, 3000);
    });
  };

  download() {
    var tempElem = document.createElement("a");
    tempElem.download = this.props.name;
    tempElem.href = this.state.sourceUrl;
    tempElem.click();
  }
  render() {
    return (
      <>
        <div className="ViewArea">
          <div
            className={`viewHeader ${
              this.state.showAddition ? "" : "hiddenvh"
            }`}
          >
            <p className="close" onClick={() => this.props.close()}>
              <RiArrowDropLeftLine />
            </p>
            <p className="fileName">{this.props.name}</p>
            {this.state.sourceUrl !== "" ? (
              <div className="downloadBtn" onClick={() => this.download()}>
                <RiDownload2Line />
                <p>다운로드</p>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="viewBody">
            {this.state.sourceUrl !== "" ? (
              <>
                {" "}
                {this.state.isViewable ? (
                  <>
                    <ViewBox
                      type={this.state.type}
                      src={this.state.sourceUrl}
                      fullMime={this.state.mime}
                      showControls={this.state.showAddition}
                    />
                  </>
                ) : (
                  <div className="directDownload">
                    <p>{this.props.name}</p>
                    <div
                      className="directDownloadBtn"
                      onClick={() => this.download()}
                    >
                      Download
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loader">
                <p>다운로드중</p>
                <div className="loadingBar">
                  <div
                    className="fullBar"
                    style={{ width: `${this.state.pctge}%` }}
                  />
                </div>
                <p className="progressData">{Math.round(this.state.pctge)}%</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
