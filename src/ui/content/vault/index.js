//미완성

import React from "react";
import "./index.css";
import { BsArrowRightShort } from "react-icons/bs";
import { AiFillLock } from "react-icons/ai";
import { decode } from "base64-arraybuffer";
import { Files } from "../files";

import { getKeyFromPw } from "../vault/vault-crypto/keyHandler";
import { FcSalesPerformance } from "react-icons/fc";

export class Vault extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unlocked: false,
      forgotPw: false,
      pwWrong: false,
      pwRight: false,
      isLoading: false,
      data: [],
    };
    this.pwRef = React.createRef();
  }

  validatePw = async () => {
    if (!this.state.pwRight) {
      if (this.pwRef.current.value.length < 1) {
        this.setState({ pwWrong: true });
      } else {
        var [isSuccess, fileKey] = await getKeyFromPw(this.pwRef.current.value);
        if (!isSuccess) {
          this.setState({ pwWrong: true });
        } else {
          console.log("all good");
          this.setState({ pwRight: true, isLoading: true });
          this.setState({ unlocked: true, isLoading: false });
        }
      }
    }
  };
  pwClick = () => {
    if (this.state.pwWrong) {
      this.setState({ pwWrong: false });
      this.pwRef.current.value = "";
    }
  };
  toggleForgot = () => {
    this.setState({ forgotPw: true, pwWrong: false });
  };

  modifyData = (index, attr, value) => {
    this.state.data[index][attr] = value;
    this.setState({ data: this.state.data });
  };

  spliceFromData = (strt, fnsh) => {
    this.state.data.splice(strt, fnsh);
  };

  setData = (data) => {
    this.setState({ data: data });
  };

  render() {
    return (
      <>
        {this.state.unlocked ? (
          <></>
        ) : (
          <>
            <div className="vault-locked-cont">
              <div className="vault-locker">
                <div className="vault-logo">
                  <AiFillLock />
                </div>
                <p className="vault-title">Unlock Vault</p>

                <div className="vault-pw">
                  <div className="vault-pwcheck" onClick={this.validatePw}>
                    {this.state.isLoading ? (
                      <div className="loading"></div>
                    ) : (
                      <BsArrowRightShort />
                    )}
                  </div>
                  <input
                    type="password"
                    style={
                      this.state.pwWrong
                        ? { border: "solid 2px #5e1a1a" }
                        : this.state.pwRight
                        ? { border: "solid 2px #1a5e1f" }
                        : {}
                    }
                    ref={this.pwRef}
                    onClick={this.pwClick}
                  ></input>
                </div>
                <div className="vault-forgot-pw" onClick={this.toggleForgot}>
                  <p>I Forgot My Password</p>
                </div>
                <div
                  className="vault-guide"
                  style={
                    this.state.forgotPw || this.state.pwWrong
                      ? { opacity: 1 }
                      : { opacity: 0 }
                  }
                >
                  {this.state.pwWrong
                    ? "Invalid Password. Please Retry"
                    : "Request Vault Content Deletion"}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
}
//            <div className="vault-login-option"><input type="checkbox"></input><p>Remember me in this session</p></div>

class VaultFiles extends React.Component {
  render() {
    return <></>;
  }
}
