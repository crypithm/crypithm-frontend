import React from "react";
import "./index.css";
import {RiArrowDropLeftLine} from 'react-icons/ri'
export class Viewer extends React.Component {

componentDidMount=async()=>{
}
  render() {
    return (
      <>
      {this.props.id?
            <div className="ViewArea">
              <div className="viewHeader">
                <p className="close">
                <RiArrowDropLeftLine />
                </p>
                <p className="fileName">
                Crypithm is cool.pdf
                </p>
              </div>
            </div>
      :<></>
      }
      </>
    );
  }
}
