import React from "react";
import { Links } from "./links/index.js";
import { Vault } from "./vault/index.js";
import { Files } from "./files/index.js";
import { menus } from "../../vars.js";
import "./index.css";
export class Content extends React.Component {
  render = () => {
    var index = menus.indexOf(this.props.currentPage);

    return (
      <>
        <div className="mainContentArea">
          {index != -1 ? (
            [
              <Files
                viewFile={(id, name) => this.props.viewFile(id, name)}
                dir={this.props.dir}
                setDirectory={(id) => this.props.setDirectory(id)}
                dragDetectionArea={this.props.dragDetectionArea}
              />,
              <Vault />,
              <Links />,
            ][index]
          ) : (
            <Files />
          )}
        </div>
      </>
    );
  };

  componentDidMount = () => {
    window.oncontextmenu = (e) => {
      e.preventDefault();
    };
  };
}
