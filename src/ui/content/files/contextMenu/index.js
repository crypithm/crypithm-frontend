import React from "react";
import './index.css'
export class ContextMenu extends React.Component {
    render() {
        return (
            <div className="contextMenu" style={{top: this.props.y, left: this.props.x}}>
                <div className="contentBtn"></div>
                <div className="contentBtn"></div>
                <div className="contentBtn"></div>
                <div className="contentBtn"></div>
            </div>
            )
    }
}