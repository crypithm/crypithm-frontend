

import React from "react";
import "./index.css";
import { RiArrowDropLeftLine } from "react-icons/ri";
import { getFileBlob } from "../../lib/crypto/decrypt";

class ViewBox extends React.Component {
  constructor(props){
    super(props)
    this.state={imgSize:['',500]}
  }
  render(){
    switch(this.props.type){
      case "image":
        return(
          <>
          <img src={this.props.src} width={this.state.imgSize[0]} height={this.state.imgSize[1]}/>
          </>
        )
    }
  }
}
export class Viewer extends React.Component {
  constructor(props){
    super(props)
    this.state={sourceUrl:"", type:""}
  }
  componentDidMount = async () => {
    var [blobSource, mime] = await getFileBlob(this.props.id, this.props.name)
    var re = /[a-zA-Z0-9_]*(\/)/;
    var type = re.exec(mime)[0];
    type = type.split('/')[0]
    this.setState({sourceUrl:blobSource, type:type})
  };

  render() {
    return (
      <>
          <div className="ViewArea">
            <div className="viewHeader">
              <p className="close" onClick={() => this.props.close()}>
                <RiArrowDropLeftLine />
              </p>
              <p className="fileName">{this.props.name}</p>
            </div>
            <div className="viewBody">
                <ViewBox type={this.state.type} src={this.state.sourceUrl} />
            </div>
          </div>
      </>
    );
  }
}
