// /src/Team/index.js

import io from 'socket.io-client'
import { connect } from 'react-redux'
import React, { Component } from 'react'

// components
import PlayerCard from './playerCard'
import PlayerSearchContainer from './../PlayerSearchContainer'

// actions 
import { 
	initData,
	openPlayerSearch,
} from './../actions'

// styles
import './../styles/index.scss'

let socket;

class Team extends Component{
	constructor(props){
		super(props);

		this._connect = this._connect.bind(this);
		this._openPlayerSearch = this._openPlayerSearch.bind(this);

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

	_openPlayerSearch({ player }){
		const { dispatch } = this.props;

		dispatch( openPlayerSearch({
			playerToReplace: player,
			openPlayerSearch: true,
		}) );
	}

	render(){
		const { _app } = this.props;
		const { squad = [] } = _app;

		return (
			<div id="_thePitch">

				{ squad.map((positionZone, i) => 

					<div key={i} className="player-container">

						{ positionZone.map(player => <PlayerCard 
														key={`${player.id}${player.team_id}`} 
														{...player} 
														onClick={ this._openPlayerSearch } />
						) }

					</div>) 

				}

				{ _app.openPlayerSearch && <PlayerSearchContainer /> }

			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
  return {
    _app: state._app,
  };
} 

export default connect(mapStateToProps)(Team);