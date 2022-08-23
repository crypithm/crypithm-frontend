import React from "react";
import "./index.css";
import { AiOutlineSearch } from "react-icons/ai";

export class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showExtend: false, extendMore: false, searchFrom: "name" };
  }
  componentDidMount = () => {
    document.addEventListener("click", (e) => {
      const search = document.querySelector("#searchBar");
      const searchExt = document.querySelector("#searchExt");
      if (!(search.contains(e.target) || searchExt.contains(e.target))) {
        this.endSearch();
      }
    });
  };
  startSearch = (e, prop) => {
    if (e.target.value.length > 1) {
      var s = this.props.data.filter((elem) =>
        new RegExp(e.target.value).test(elem[prop])
      );
      if (prop.length > 0) {
        console.log(s.map((elem) => elem.name));
      }
    }
  };

  endSearch = (e) => {
    this.setState({ showExtend: false });
  };
  openSearch = () => {
    this.setState({ showExtend: true });
  };

  setSearchFrom = (itm) => {
    this.setState({ searchFrom: itm });
  };

  render() {
    return (
      <>
        <input
          type="text"
          placeholder="Search File, Folder"
          className={`searchBar ${this.state.showExtend ? "active" : ""}`}
          onChange={(e) => this.startSearch(e, this.state.searchFrom)}
          onClick={this.openSearch}
          id="searchBar"
        ></input>
        <div
          className={`searchResult ${this.state.showExtend ? "show" : ""}`}
          id="searchExt"
        >
          <div className="searchTitle"></div>
          <div className="searchFrom">
            <p className="title">Search By:</p>
            <p
              className={`item ${
                this.state.searchFrom === "name" ? "focused" : ""
              }`}
              onClick={() => this.setSearchFrom("name")}
            >
              Name
            </p>
            <p
              className={`item ${
                this.state.searchFrom === "date" ? "focused" : ""
              }`}
              onClick={() => this.setSearchFrom("date")}
            >
              Date
            </p>
          </div>
        </div>
      </>
    );
  }
}
