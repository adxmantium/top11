// /reducers/index.js

import { find, filter } from 'lodash'

let init = {};

export default function(state = init, action) {

    switch(action.type) {

        case '_APP:FETCHING_INIT_DATA':
            return {...state, ...action.payload};

        case '_APP:FETCHED_INIT_DATA':
            const { favoriteFormation, topPlayers } = action.payload;

    		return {
                ...state, 
                ...action.payload,
                top11: _initTop11({ favoriteFormation, topPlayers }),
            };

        default:
            return state;
            
    }

};

const _initTop11 = ({ favoriteFormation, topPlayers }) => {
    const { positions = [] } = favoriteFormation;

    return topPlayers.reduce((top, player) => {

        return positions.includes(player.saved_position) ? [...top, player] : top;

    }, []); 
}

const findPlayers = ({ allPlayers }) => {
	const top = ['messi', 'ronaldo', 'neymar', 'hazard', 'coutinho', 'pogba', 'verratti', 'alaba', 'ramos', 'pique', 'chiellini', 'alves'];

	const found = filter(allPlayers.slice(), player => {
		console.log(`${player.name} : team_${player.team_id}_player_${player.id}`);
		return player.name.toLowerCase().includes(top);
	});

    console.log('found: ', found);
}