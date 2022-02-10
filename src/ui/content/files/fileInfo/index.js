import React from "react";
import "./index.css";

export class FileInfo extends React.Component {
  render() {
    return (
      <>
        <div className="background-svg">
          <div className="centered-menu">
            <div className="thumbnail-img">
              <img src="https://media.moddb.com/images/members/5/4550/4549205/duck.jpg"></img>
            </div>
            <div className="textArea">
                <p className="name"><div className="textBold">Name:</div> DuckDuckDuckDuckDuck.png</p>
                <p><div className="textBold">Type:</div> image/png</p>
                <p><div className="textBold">Size:</div> 5MB</p>
                <p><div className="textBold">Last Modified:</div> 2022-02-02</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
