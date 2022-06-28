import React from "react";
import { Leftmenu } from "./ui/left-menubar/index.js";
import { Header } from "./ui/header/index.js";
import { menus } from "./vars";
import { Content } from "./ui/content/index.js";
import { Viewer } from "./ui/viewer";
import { getAllFiledata, getFolders } from "./lib/crypto/decrypt";

export class Crypithm extends React.Component {
  constructor(props) {
    super(props);
    this.dragDetectionArea = React.createRef();
    this.state = {
      currentPage: window.location.pathname.split("/")[1],
      mobileMenuOpen: false,
      viewingFileId: "",
      viewingFileName: "",
      currentDir: "/ 0",
      selectedIds: [],
      data: [],
      folders:[]
    };
  }

  refreshFolders = async () => {
    this.setState({ folders: await getFolders(localStorage.getItem("key")) });
  };
  

  setDirectory = (id) => {
    this.setState({ currentDir: id });
  };
  pushedToState = () => {
    this.setState({ currentPage: window.location.pathname.split("/")[1] });
  };
  pushToUpData = (id, name, dir) => {
    this.setState({
      data: this.state.data.concat({ id: id, name: name, dir: dir }),
    });
  };
  setData = (data) => {
    this.setState({ data: data });
  };
  spliceFromData = (strt, fnsh) => {
    this.state.data.splice(strt, fnsh);
  };
  componentDidMount = async () => {
    localStorage.setItem("dir", "/ 0");
    window.onpopstate = () => {
      var currentPage = window.location.pathname.split("/")[1];
      this.setState({ currentPage: currentPage });
    };
    if (menus.indexOf(this.state.currentPage) == -1) {
      window.location.href="/files"
    }
    var decryptedJsonarray = await getAllFiledata(localStorage.getItem("key"));
    this.setState({ folders: await getFolders(localStorage.getItem("key")) });
    this.setState({ data: decryptedJsonarray });
  };

  toggleMobileMenu = () => {
    this.setState({ mobileMenuOpen: this.state.mobileMenuOpen ? false : true });
  };
  closeViewer = () => {
    this.setState({ viewingFileId: null });
  };
  startView = async (id, name) => {
    this.setState({ viewingFileId: id, viewingFileName: name });
  };
  setSelIds = (idList) => {
    this.setState({ selectedIds: idList });
  };
  findElemIndex = (id, returnFullObj) => {
    for (var i = 0; i < this.state.data.length; i++) {
      if (this.state.data[i].id == id) {
        if (returnFullObj) {
          return this.state.data[i];
        } else {
          return i;
        }
      }
    }
    return -1;
  };
  moveFilesToDir = async (idList, target) => {
    if (idList.indexOf(target) == -1 && idList.length > 0) {
      var newForm = new FormData();
      newForm.append("targetObjs", JSON.stringify(idList));
      newForm.append("target", target);
      newForm.append("action", "move");
      var resp = await fetch(`https://crypithm.com/api/folder`, {
        headers: {
          Authorization: localStorage.getItem("tk"),
        },
        method: "POST",
        body: newForm,
      });
      var jsn = await resp.json();
      await this.refreshFolders()
      if (jsn.StatusMessage == "Success") {
        var q = [];
        for (var i = 0; i < idList.length; i++) {
          let index = this.findElemIndex(idList[i]);
          var elem = this.state.data[index];
          elem.dir = target;
          this.spliceFromData(index, 1);
          q.push(elem);
        }
        this.setData(this.state.data.concat(q));
      }
    }
  };
  render = () => {
    return (
      <>
        {this.state.viewingFileId ? (
          <Viewer
            id={this.state.viewingFileId}
            close={() => this.closeViewer()}
            name={this.state.viewingFileName}
          ></Viewer>
        ) : (
          <></>
        )}
        <Header mobileMenu={() => this.toggleMobileMenu()} />

        <div ref={this.dragDetectionArea}>
          <Leftmenu
            currentPage={this.state.currentPage}
            updateFunc={() => this.pushedToState()}
            ismobileMenuOpen={this.state.mobileMenuOpen}
            setDirectory={(id) => this.setDirectory(id)}
            currentDir={this.state.currentDir}
            selectedIds={this.state.selectedIds}
            setSelected={(idl) => this.setSelIds(idl)}
            setData={(data) => this.setData(data)}
            data={this.state.data}
            spliceFromData={(strt, fnsh) => this.spliceFromData(strt, fnsh)}
            moveFtoD={(idl, targ)=>this.moveFilesToDir(idl, targ)}
            folders={this.state.folders}
          />
          <Content
            currentPage={this.state.currentPage}
            viewFile={(id, name) => this.startView(id, name)}
            dir={this.state.currentDir}
            setDirectory={(id) => this.setDirectory(id)}
            dragDetectionArea={this.dragDetectionArea}
            selectedIds={this.state.selectedIds}
            setSelected={(idl) => this.setSelIds(idl)}
            data={this.state.data}
            pushToUpData={(id, name, dir) => this.pushToUpData(id, name, dir)}
            setData={(data) => this.setData(data)}
            spliceFromData={(strt, fnsh) => this.spliceFromData(strt, fnsh)}
            moveFtoD={(idl, targ)=>this.moveFilesToDir(idl, targ)}
          />
        </div>
      </>
    );
  };
}
