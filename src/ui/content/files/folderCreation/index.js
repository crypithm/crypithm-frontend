import React from "react";
import './index.css';

export class Foldercreation extends React.Component {
    unMount=()=>{
        this.props.root.unmount();
    }
    render = () => {
        return (
            <>
            <div className="background-svg" onClick={this.unMount}>
            </div>
            <div className="folderCreationArea">
                    <div className="title">
                        <p>Folder Creation</p>
                    </div>
                    <div className="body">
                        <div className="nameInput">
                            Name
                            <input type="text" placeholder="Folder Name"></input>
                        </div>
                        <div className="buttons">
                            <div className="creationBtn" onClick={this.unMount}>
                                Cancel
                            </div>
                            <div className="creationBtn" style={{backgroundColor:"rgba(255,255,255,0.3)",color: "#000"}}>
                            Create
                            </div>
                        </div>
                    </div>

                </div>
            </>
        )
    }
}
