// /reducers/index.js

import { find, filter } from 'lodash'

let init = {};

export default function(state = init, action) {

    switch(action.type) {

    	case '_APP:FETCHED_INIT_DATA':
    	case '_APP:FETCHING_INIT_DATA':
    		return {...state, ...action.payload};

        default:
            return state;
            
    }

};

const findPlayers = ({ allPlayers }) => {
	const top = ['messi', 'ronaldo', 'neymar', 'hazard', 'coutinho', 'pogba', 'verratti', 'alaba', 'ramos', 'pique', 'chiellini', 'alves'];

	const found = filter(allPlayers.slice(), player => {
		console.log(`${player.name} : team_${player.team_id}_player_${player.id}`);
		return player.name.toLowerCase().includes(top);
	});

    console.log('found: ', found);
}