import React from "react";
import "./index.css";

export class Viewer extends React.Component {

componentDidMount=async()=>{
}
  render() {
    return (
      <>
      {this.props.id?
            <div className="ViewArea">
          
            </div>
      :<></>
      }
      </>
    );
  }
}
