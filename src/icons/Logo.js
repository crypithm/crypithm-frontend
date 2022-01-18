import React from "react";

export class Logo extends React.Component {
    render() {
        return(
            <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 100 100"  width={this.props.width} style={{opacity: this.props.opacity}}>
                <rect width="72.13" height="70.87" style={{fill:"#fff"}}/>
                <rect x="20.44" y="21.79" style={{fill:"none", stroke: '#fff', strokeWidth: 15, strokeMiterlimit: 10}} width="72.13" height="70.87"/>
                <rect x="14.38" y="14.66" style={{fill: '#fff'}} width="40.63" height="40.63"/>
            </svg>
        )
    }
}
