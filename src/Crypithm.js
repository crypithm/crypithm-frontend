import React from "react";
import { Leftmenu } from "./ui/left-menubar/index.js";
import { Header } from "./ui/header/index.js";
import { menus } from "./vars";
import { Content } from "./ui/content/index.js";

export class Crypithm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentPage: window.location.pathname.split("/")[1], mobileMenuOpen: false };
  }
  pushedToState = () => {
    this.setState({ currentPage: window.location.pathname.split("/")[1] });
  };
  componentDidMount = () => {
    window.onpopstate = () => {
      var currentPage = window.location.pathname.split("/")[1];
      this.setState({ currentPage: currentPage });
    };
    if (menus.indexOf(this.state.currentPage) == -1) {
      window.history.pushState({}, "", "files");
    }
  };
  toggleMobileMenu=()=>{
    this.setState({mobileMenuOpen:this.state.mobileMenuOpen?false:true})
  }
  render = () => {
    return (
      <>
        <Leftmenu
          currentPage={this.state.currentPage}
          updateFunc={() => this.pushedToState()}
          ismobileMenuOpen={this.state.mobileMenuOpen}
        />
        <Header mobileMenu={()=>this.toggleMobileMenu()}/>
        <Content currentPage={this.state.currentPage} />
      </>
    );
  };
}
