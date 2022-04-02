import React from "react";
import './index.css'
export class ContextMenu extends React.Component {
    render() {
        return (
            <div className="contextMenu" style={{top: this.props.y, left: this.props.x}}>
                <div className="contentBtn">Delete</div>
                <div className="contentBtn">Rename</div>
                <div className="contentBtn">View</div>
                <div className="contentBtn">Download</div>
            </div>
            )
    }
}