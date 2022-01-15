import React from "react";
import {Logo} from '../../icons/Logo';
import './index.css';

export class Leftmenu extends React.Component {
    render() {
        return (
          <>
          <div className='leftmenu'>
              <div className="logo"><Logo width={30} opacity={0.3} color={"#fff"}/><b>Crypithm Cloud</b></div> 
              <div className="buttonArea">
                <div className="button">
                  All Files
                </div>
                <div className="button">
                  DS&copy; Vault
                </div>
                <div className="button">
                  Links
                </div>
              </div>
              <div className="userInfoArea">
                <b>Welcome Home, Developer</b>
                <div className="progressArea">
                  <progress max='90' value='80'></progress>
                  <b>8GB out of 10GB used</b>
                </div>

              </div>
            </div>
          </>
        )
    }
}
