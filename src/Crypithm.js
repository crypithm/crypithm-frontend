import React from 'react';
import {Logo} from './icons/Logo'
import {Leftmenu} from './ui/left-menubar/index.js'
import {Header} from './ui/header/index.js'

export class Crypithm extends React.Component {
  render() {
    return (
      <>
      <Leftmenu />
      <Header />
      </>
    )
  }
}