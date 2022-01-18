import React from "react";
import { Links } from './links/index.js';
import { Vault } from './vault/index.js';
import { Files } from './files/index.js'
import { menus } from '../../vars.js'
export class Content extends React.Component {

    render() {
        var index = menus.indexOf(this.props.currentPage)
        return (
          <>
            {index!=-1 ? [<Files />, <Vault />, <Links />][index]:<Files />}
          </>
        )
    }
}
