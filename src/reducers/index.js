// /reducers/index.js

import { find } from 'lodash'

let init = {};

const popularPlayerTeamIds = [
  '524', // psg
  '86', // madrid
  '64', // liverpool
  '81', // barcelona
  '5', // bayern
  '66', // united
  '109', // juve
]

export default function(state = init, action) {

    let newState = null;

    switch(action.type) {

        case '_APP:FETCHING_INIT_DATA':
        case '_APP:OPEN_PLAYER_SEARCH':
          return {...state, ...action.payload};

        case '_APP:FETCHED_INIT_DATA':
          var { favoriteFormation, topPlayers, allTeams, allPlayers } = action.payload;

          var topPlayersWithTeamBadge = _initTeamBadgeForEachPlayer({ topPlayers, allTeams });

          // reduce top players by the favorite formation
          var top11 = _initTop11({ favoriteFormation, topPlayers: topPlayersWithTeamBadge });

          // filter out players by position into their own array
          var filteredPositions = _filterPositions({ top11 });

          // filter out "popular players" to init searchResults list
          var initSearchResults = _getPopularPlayers({ allTeams, allPlayers });

      		return {
            ...state, 
            ...action.payload,
            topPlayers: topPlayersWithTeamBadge,
            top11,
            ...filteredPositions,
            initSearchResults,
            searchResults: initSearchResults, // init w/ players from popular teams Barcelona, Madrid, Bayern, Juventus, United
          };

        case '_APP:UPDATE_PLAYER_RESULTS':
          const { searchValue } = action.payload;

          newState = {...state, searchValue};

          newState.searchResults = [...state.allPlayers].filter(player => player.name.toLowerCase().includes(searchValue.toLowerCase()));

          return newState;

        case '_APP:REPLACE_PLAYER':
          const { player: newPlayer } = action.payload;

          newState = {...state};

          var { playerToReplace, allTeams, top11, squad } = newState;

          // loop through each 'zone' of the squad looking for playerToReplace
          newState.squad = squad.map(zone => {

            return zone.map(player => {

              // find playerToReplace in current top11 and replace w/ newPlayer
              if( player.id == playerToReplace.id || player.name === playerToReplace.name ){

                // get new players team crest, if player doesn't have it
                if( !newPlayer.crestUrl ){
                  const teamFound = find([...state.allTeams], team => team.id == newPlayer.team_id);

                  if( teamFound ) return {...newPlayer, crestUrl: teamFound.crestUrl || ''}; // return newPlayer w/ team crest
                }

                return newPlayer; // else return newPlayer
              }

              return player;
            })

          }) 

          return newState;

        default:
            return state;
            
    }

};

const _getPopularPlayers = ({ allTeams, allPlayers }) => {
  // find teams that match popularPlayerTeamIds 
  const popularTeams = [...allTeams].filter(team => popularPlayerTeamIds.includes(''+team.id));
  const allPlayersCopy = [...allPlayers];

  let popularPlayers = [];

  // forEach team, get all players for that team id
  popularTeams.forEach(team => {

    popularPlayers = [
      ...popularPlayers,
      ...allPlayersCopy.filter(player => player.team_id == team.id)
    ]

  })

  return popularPlayers;
}

const _initTeamBadgeForEachPlayer = ({ topPlayers, allTeams }) => {
    let teamFound = null;

    return topPlayers.map(player => {

      // only search for player's team crest if they don't already have one
      if( !player.crestUrl ){
        // find team from allTeams list
        teamFound = find([...allTeams], team => team.id == player.team_id);

        // if team is found and not falsy, return new player obj w/ teams crestUrl
        if( teamFound ) return {...player, crestUrl: teamFound.crestUrl || ''};
      } 

      return player;

    })

}

const _filterPositions = ({ top11 }) => {
    const positionTypes = ['forwards', 'midfielders', 'backs', 'keeper'];

    const positionLists = {
      forwards: [],
      midfielders: [],
      backs: [],
      keeper: [],
    };

    const [ forwards, midfielders, backs, keeper ] = positionTypes;

    const first4Forw = forwards.slice(0, 4),
          first4Midf = midfielders.slice(0, 4),
          first4Defe = backs.slice(0, 4),
          first4Keep = keeper.slice(0, 4);

    let listName = '';

    top11.forEach(player => {

      if( player.saved_position.includes(first4Forw) ) listName = forwards;
      else if( player.saved_position.includes(first4Midf) ) listName = midfielders;
      else if( player.saved_position.includes(first4Defe) ) listName = backs;
      else listName = keeper;

      positionLists[listName].push( player );

    });

    positionLists.squad = positionTypes.map(position => positionLists[position]);

    return positionLists;
}

const _initTop11 = ({ favoriteFormation, topPlayers }) => {
    const { positions = [] } = favoriteFormation;

    return topPlayers.reduce((top, player) => {

        return positions.includes(player.saved_position) ? [...top, player] : top;

    }, []); 
}

const findPlayers = ({ allPlayers }) => {
	const top = ['messi', 'ronaldo', 'neymar', 'hazard', 'coutinho', 'pogba', 'verratti', 'alaba', 'ramos', 'pique', 'chiellini', 'alves'];

	const found = [...allPlayers].filter(player => {

		console.log(`${player.name} : team_${player.team_id}_player_${player.id}`);

		return player.name.toLowerCase().includes(top);

	});

    console.log('found: ', found);
}