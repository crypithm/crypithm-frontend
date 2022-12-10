import React from "react";
import { Vault } from "./vault/index.js";
import { Files } from "./files/index.js";
import { menus } from "../../vars.js";
import "./index.css";

export class Content extends React.Component {
  render = () => {
    var index = menus.indexOf(this.props.currentPage);
    var files = (
      <Files
        viewFile={(id, name) => this.props.viewFile(id, name)}
        dir={this.props.dir}
        setDirectory={(id) => this.props.setDirectory(id)}
        dragDetectionArea={this.props.dragDetectionArea}
        selectedIds={this.props.selectedIds}
        setSelected={(idl) => this.props.setSelected(idl)}
        pushToUpData={(id, name, dir, size) =>
          this.props.pushToUpData(id, name, dir, size)
        }
        setData={(data) => this.props.setData(data)}
        data={this.props.data}
        spliceFromData={(strt, fnsh) => this.props.spliceFromData(strt, fnsh)}
        moveFtoD={(idl, targ) => this.props.moveFtoD(idl, targ)}
        isLoading={this.props.isLoading}
        modifyData={(a, b, c) => this.props.modifyData(a, b, c)}
        refreshFolder={() => this.props.refreshFolder()}
      />
    );
    return (
      <>
        <div className="mainContentArea">
          {index != -1 ? [files, <Vault />][index] : files}
        </div>
      </>
    );
  };

  componentDidMount = () => {
    localStorage.setItem(
      "tk",
      "HjJakFlL5SYegEM69EQl4yrpyWX467WwIAt7AppLrQxokpZgeS"
    );
    localStorage.setItem(
      "key",
      "fY9MBDBKU7S2TOuBASJCj4PvHcMGS0umiUf7VuIye3zqLJbNJ84MJE8KQciMqGU10Vh0oyjFAsFHOa1JE6R9VHQKTBtPXMVSMZp0"
    );
    window.oncontextmenu = (e) => {
      e.preventDefault();
    };
  };
}
