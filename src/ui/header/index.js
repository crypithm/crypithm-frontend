import React from "react";
import "./index.css";

export class Header extends React.Component {
  render() {
    return (
      <>
        <div className="header">
          <input type="text" placeholder="Search File, Folder"></input>{" "}
        </div>
      </>
    );
  }
}
