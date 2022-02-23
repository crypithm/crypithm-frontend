import React from "react";
import "./index.css";

export class FileInfo extends React.Component {
  render() {
    if(this.props.b) {
    return (
      <>
        <div className="background-svg">
          <div className="centered-menu">
            <div className="thumbnail-img">
              <img src="https://media.moddb.com/images/members/5/4550/4549205/duck.jpg"></img>
            </div>
            <div className="textArea">
                <div className="textboxArea name"><div className="textBold">Name:</div><div className="textLight"> Duck-Shaped-BananaTapedOnWall.png</div></div>
                <div className="textboxArea"><div className="textBold">Type:</div><div className="textLight"> PNG image</div></div>
                <div className="textboxArea"><div className="textBold">Size:</div><div className="textLight"> 5MB</div></div>
                <div className="textboxArea"><div className="textBold">Last Modified:</div> <div className="textLight"> 2022-02-10</div></div>
            </div>
          </div>
        </div>
      </>
    );      
    }else {
      return<></>
    }

  }
}
