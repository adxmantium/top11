// /src/Team/index.js

import { reduce } from 'lodash'
import io from 'socket.io-client'
import { connect } from 'react-redux'
import React, { Component } from 'react'

// actions 
import { initData } from './../actions'

// styles
import './../styles/index.scss'

let socket;

class Team extends Component{
	constructor(props){
		super(props);

		this._connect = this._connect.bind(this);

		// socket = io(`${window.location.host}:3211`);

		// socket.on('connected:user', this._connect);
	}

	componentWillMount(){
		console.log('socket, ', socket);
		this._connect();
		this._initData();
	}

	_initData(){
		const { dispatch } = this.props;
		dispatch( initData() );
	}

	_connect(){
		// socket.emit('connect:user', {
		// 	name: 'John'
		// });
	}

	render(){
		const { _app } = this.props;
		const { top11 = [], forwards = [], midfielders = [], backs = [], keeper = [] } = _app;

		return (
			<div id="_thePitch">

				<div className="player-container">
					{ forwards.map(playr => <Player key={`${playr.id}${playr.team_id}`} {...playr} />) }
				</div>

				<div className="player-container">
					{ midfielders.map(playr => <Player key={`${playr.id}${playr.team_id}`} {...playr} />) }
				</div>

				<div className="player-container">
					{ backs.map(playr => <Player key={`${playr.id}${playr.team_id}`} {...playr} />) }
				</div>

				<div className="player-container">
					{ keeper.map(playr => <Player key={`${playr.id}${playr.team_id}`} {...playr} />) }
				</div>

			</div>
		);
	}
}

const Player = ({ name, position, crestUrl }) => (
	<div className="player-card" style={{backgroundImage: `url(${crestUrl})`}}>
		<div className="badge-layer" />
		{/*<div className="badge" >
		</div>*/}
		<div className="info">
			<div className="name">{ name }</div>
			<div className="position">{ position }</div>
		</div>
	</div>
)

const mapStateToProps = (state, props) => {
  return {
    _app: state._app,
  };
} 

export default connect(mapStateToProps)(Team);