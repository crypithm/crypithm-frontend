import React from "react";
import './index.css';
import {BsArrowRightShort} from 'react-icons/bs'
import {AiFillLock} from 'react-icons/ai'
import { decode } from "base64-arraybuffer";

import {getKeyFromPw} from '../vault/vault-crypto/keyHandler'

export class Vault extends React.Component {
  constructor(props){
    super(props)
    this.state={unlocked:false, forgotPw:false, pwWrong:false}
    this.pwRef = React.createRef()
  }

  validatePw = async()=>{
    var [isSuccess, fileKey] = await getKeyFromPw(this.pwRef.current.value)
    if(!isSuccess) {
      this.setState({pwWrong:true})
    }else{
      console.log("all good")
    }
  }
  pwClick=()=>{
    if(this.state.pwWrong){
      this.setState({pwWrong:false})
      this.pwRef.current.value=""
    }
  }
  componentDidMount=async()=>{
  }
  toggleForgot=()=>{
    this.setState({forgotPw:true, pwWrong:false})
  }
    render() {
      return(
        <>
        {this.state.unlocked?
        <>
        <div className="vault-main">

        </div>
        </>:
        <>
        <div className="vault-locked-cont">
          <div className="vault-locker">
            <div className="vault-logo">
            <AiFillLock />
            </div>
            <p className="vault-title">
            Unlock Vault
            </p>
      
            <div className="vault-pw">
              <div className="vault-pwcheck"onClick={this.validatePw} ><BsArrowRightShort /></div>
              <input type="password" style={this.state.pwWrong?{border: "solid 2px #5e1a1a"}:{}} ref={this.pwRef} onClick={this.pwClick}></input>
            </div>
            <div className="vault-forgot-pw" onClick={this.toggleForgot}>
            <p >I Forgot My Password</p>
            </div>
            <div className="vault-guide" style={this.state.forgotPw||this.state.pwWrong?{opacity:1}:{opacity:0}}>
              {this.state.pwWrong?"Invalid Password. Please Retry":"Request Vault Content Deletion"}
            </div>
          </div>
        </div>
        </>}
        </>
      )
    }
}


class VaultFiles extends React.Component {
  render(){
    return(
      <></>
    )
  }
}