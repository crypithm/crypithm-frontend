import React from "react";
import "./index.css";
import { viewableType } from "../../vars";
import { RiArrowDropLeftLine,RiZoomInLine,RiZoomOutLine,RiFullscreenLine,RiFullscreenExitLine,RiDownload2Line  } from "react-icons/ri";
import { getFileBlob } from "../../lib/crypto/decrypt";


class ViewBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imgSize:[window.innerWidth * 0.85, ""],isFull:false };
    this.imgRef = React.createRef()
  }


  imgScaleChange = async (zoomin) => {
    if (!zoomin) {
      this.setState({ imgSize:[this.state.imgSize[0] * 0.75, ""] });
    } else {
      this.setState({ imgSize:[this.state.imgSize[0] * 1.25, ""] });
    }
  };


  setFullScreen=()=>{
    if(!this.state.isFull){
      this.setState({imgSize:[window.innerWidth,""],isFull:true})
    }else{
      this.setState({imgSize:[window.innerWidth * 0.85, ""], isFull:false})
    }
  }
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
            <div className="imgControl" style={{display:this.props.showControls?"":"none"}}>
              <div className="focus">
                <div className="eachBtn" onClick={()=>this.imgScaleChange(true)}>
                <RiZoomInLine />
                </div>
                <div className="eachBtn" onClick={()=>this.imgScaleChange(false)}>
                <RiZoomOutLine />
                </div>
                <div className="eachBtn" onClick={this.setFullScreen}>
                {this.state.isFull?<RiFullscreenExitLine />:<RiFullscreenLine />}
                </div>
              </div>
            </div>
          </>
        );
      case "application":
        console.log(this.props.fullMime)
        if(this.props.fullMime.split("/")[1]=="pdf"){
          return(
            <></>
          )
        }
    }
  }
}

export class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sourceUrl: "", type: "",  mime:"", showAddition: true };
  }
  componentDidMount = async () => {
    var [blobSource, mime] = await getFileBlob(this.props.id, this.props.name);
    var prevtoid=""
    var tf = true;
    if (viewableType.indexOf(mime) == -1) {
      tf = false;
    }
    this.setState({ sourceUrl: blobSource, isViewable: tf, mime:mime });
    window.addEventListener("mousemove",()=>{
      this.setState({showAddition:true})
      clearTimeout(prevtoid)
      prevtoid = setTimeout(()=>{this.setState({showAddition:false})},3000)
    })

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
          <div className={`viewHeader ${this.state.showAddition ? "" : "hiddenvh"}`}>
            <p className="close" onClick={() => this.props.close()}>
              <RiArrowDropLeftLine />
            </p>
            <p className="fileName">{this.props.name}</p>
            {this.state.sourceUrl !=""?<div className="downloadBtn" onClick={() => this.download()}><RiDownload2Line /><p>다운로드</p></div>:<></>}
          </div>
          <div className="viewBody">
            {this.state.sourceUrl != "" ? (
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
              <div className="loader"></div>
            )}
          </div>
        </div>
      </>
    );
  }
}
