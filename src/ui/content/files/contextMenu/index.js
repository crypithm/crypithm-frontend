import React from "react";
import './index.css'
export class ContextMenu extends React.Component {

    componentDidMount=()=>{
        window.addEventListener('mousedown',(e)=>{
            this.unMount()
        })
    }
    componentWillUnmount=()=>{
        window.removeEventListener('mousedown',window)
    }
    unMount = () => {
        this.props.root.unmount();
    }
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