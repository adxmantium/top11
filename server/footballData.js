// /server/footballData.js

const _ = require('lodash');

const COMPETITION_API = 'http://api.football-data.org/v1/competitions/?season=2017';

// create axios intance and set football-data api
const axios = require('axios')
const _axios = axios.create({
	headers: {'X-Auth-Token': '170dac285e4c4b78a13c650df41ac489'} // 50 requests per minute
});

const LEAGUES_I_CARE_ABOUT = [
	'PL', // Premier League
	'FL1', // Ligue 1
	'BL1', // Bundesliga
	'PD', // La Liga
	'SA', // Serie A
];

// contains the player keys of my top 11
const MY_TOP_11 = [
	'team_81_player_20', // messi
	'team_86_player_16', // ronaldo
	'team_81_player_18', // neymar
	'team_61_player_12', // hazard 
	'team_64_player_18', // coutinho
	'team_66_player_14', // pogba
	'team_524_player_15', // verratti
	'team_86_player_18', // bale
	'team_5_player_7', // alaba
	'team_86_player_4', // ramos
	'team_109_player_6', // chiellini
	'team_5_player_5', // hummels
	'team_109_player_10', // alves
	'team_5_player_1', // neuer
];

const FORMATIONS = [
	'4-3-3',
	'3-4-3',
	'4-4-2',
	'5-4-1',
	'4-2-3-1',
];

const POSITIONS = [
	'position_forward_left',
	'position_forward_center',
	'position_forward_right',
	'position_midfield_left',
	'position_midfield_centerLeft',
	'position_midfield_center',
	'position_midfield_centerAttack',
	'position_midfield_centerRight',
	'position_midfield_right',
	'position_back_left',
	'position_back_centerLeft',
	'position_back_center',
	'position_back_centerRight',
	'position_back_right',
	'position_keeper',
];

const TOP_PLAYERS = [
	['position_forward_left', 'position', 'position_forward_left', 'player', 'team_86_player_16'],
	['position_forward_center', 'position', 'position_forward_center', 'player', 'team_81_player_20'],
	['position_forward_right', 'position', 'position_forward_right', 'player', 'team_81_player_18'],
	['position_midfield_left', 'position', 'position_midfield_left', 'player', 'team_61_player_12'],
	['position_midfield_centerLeft', 'position', 'position_midfield_centerLeft', 'player', 'team_64_player_18'],
	['position_midfield_center', 'position', 'position_midfield_center', 'player', 'team_524_player_15'],
	['position_midfield_centerAttack', 'position', 'position_midfield_centerAttack', 'player', 'team_524_player_15'],
	['position_midfield_centerRight', 'position', 'position_midfield_centerRight', 'player', 'team_66_player_14'],
	['position_midfield_right', 'position', 'position_midfield_right', 'player', 'team_86_player_18'],
	['position_back_left', 'position', 'position_back_left', 'player', 'team_5_player_7'],
	['position_back_centerLeft', 'position', 'position_back_centerLeft', 'player', 'team_5_player_5'],
	['position_back_center', 'position', 'position_back_center', 'player', 'team_109_player_6'],
	['position_back_centerRight', 'position', 'position_back_centerRight', 'player', 'team_86_player_4'],
	['position_back_right', 'position', 'position_back_right', 'player', 'team_109_player_10'],
	['position_keeper', 'position', 'position_keeper', 'player', 'team_5_player_1'],
];


const REDIS_TOP_11_KEY = 'top_11';
const REDIS_LEAGUE_KEY = 'leagues';
const REDIS_POSITIONS_KEY = 'positions';
const REDIS_TOP_PLAYERS_KEY = 'position_keeper';
const REDIS_FORMATIONS_TYPES_KEY = 'formation_types';
const REDIS_FAVORITE_FORMATION = 'favorite_formation';
const REDIS_FORMATIONS_POSITIONS_KEY = 'formation_positions';

let _redis = null;

// use football-data api to populate redis db w/ data
const _initDataIfDBIsEmpty = redis => {
	_redis = redis;

	// get leagues
	_redis.exists(REDIS_LEAGUE_KEY, (err, exist) => {
		if( !exist ) _getLeagues();
	});

	// init top 11
	_redis.exists(REDIS_TOP_11_KEY, (err, exist) => {
		if( !exist ) _initTop11();
	});

	// init positions
	_redis.exists(REDIS_POSITIONS_KEY, (err, exist) => {
		if( !exist ) _initPositions();
	});

	// init top players
	_redis.exists(REDIS_TOP_PLAYERS_KEY, (err, exist) => {
		if( !exist ) _initTopPlayers();
	});

	// init formations
	_redis.exists(REDIS_FORMATIONS_TYPES_KEY, (err, exist) => {
		if( !exist ) _initFormations();
	});

	// init formations
	_redis.exists(REDIS_FORMATIONS_TYPES_KEY, (err, exist) => {
		if( !exist ) _initFormations();
	});

	_redis.exists(REDIS_FAVORITE_FORMATION, (err, exist) => {
		if( !exist ) _initFavoriteFormation();
	})

}

const _initFavoriteFormation = () => _redis.set(REDIS_FAVORITE_FORMATION, '4-3-3');

const _initFormations = () => {
	const POSITIONS_COPY = [...POSITIONS];
	let specificPositions = null;

	const mappedFormations = FORMATIONS.map(key => {

		switch( key ){

		 	case '4-3-3':
		 		specificPositions = _.without(POSITIONS_COPY, ...[
	 				'position_midfield_left', 
	 				'position_midfield_right', 
	 				'position_back_center',
	 				'position_midfield_centerAttack',
	 			])	

		 		break;

		 	case '3-4-3':
	 			specificPositions = _.without(POSITIONS_COPY, ...[
	 				'position_back_left', 
	 				'position_back_right', 
	 				'position_midfield_center', 
	 				'position_midfield_centerAttack',
	 			])

	 			break;

		 	case '4-4-2':
	 			specificPositions = _.without(POSITIONS_COPY, ...[
	 				'position_back_center', 
	 				'position_midfield_center', 
	 				'position_midfield_centerAttack',
	 				'position_forward_center', 
	 			])

	 			break;

		 	case '5-4-1':
	 			specificPositions = _.without(POSITIONS_COPY, ...[
	 				'position_midfield_center', 
	 				'position_midfield_centerAttack',
	 				'position_forward_left', 
	 				'position_forward_right', 
	 			])

	 			break;

		 	case '4-2-3-1':
	 			specificPositions = _.without(POSITIONS_COPY, ...[
	 				'position_midfield_center', 
	 				'position_forward_left', 
	 				'position_forward_right', 
	 				'position_back_center',
	 			])

	 			break;
		 }

		 return [key, ...specificPositions];

	});

	// save formation types
	_redis.sadd(REDIS_FORMATIONS_TYPES_KEY, ...FORMATIONS);

	mappedFormations.forEach(forma => {

		_redis.sadd(forma);

	})
}

const _initTopPlayers = () => {

	console.log('initializing top players');
	TOP_PLAYERS.forEach( player => _redis.hmset(player) );

}

const _initPositions = () => {

	console.log('initializing positions');
	_redis.sadd(REDIS_POSITIONS_KEY, ...POSITIONS);	

}

const _initTop11 = () => {

	console.log('initializing top 11');
	// add player keys as redis sets
	_redis.sadd(REDIS_TOP_11_KEY, ...MY_TOP_11);

}

const _getLeagues = () => {

	_axios.get( COMPETITION_API )
		  .then( _getTeamsFromLeague )
		  .catch( err => console.log('league error: ', err) );

}

const _getTeamsFromLeague = ({ data: leagues }) => {

	leagues.forEach(aLeague => {
		let { league } = aLeague;

		// save leaves as a set in redis
		_redis.sadd(REDIS_LEAGUE_KEY, ...LEAGUES_I_CARE_ABOUT);

		// only get the teams of leagues I care about right now
		if( LEAGUES_I_CARE_ABOUT.includes( league ) ){

			// GET teams from each league
			_axios.get( aLeague._links.teams.href )
				  .then( ({ data }) => _saveTeamsAndGetPlayers({ data, league }) )
				  .catch( err => console.log('team error: ', err) );

		}
		
	})

}

const _saveTeamsAndGetPlayers = ({ data, league }) => {
	const mappedTeams = [],
		  leftOverTeamsURL = [],
		  secondLeftOverTeamsURL = [];

	let id = '',
		_team = [],
		redis_hash_identifier = '';

	console.log('------------------------ first group');
	// stringify each team and add to list
	data.teams.forEach(team => {

		// get id from link
		id = team._links.self.href.split('/').reverse()[0];
		team.id = id;

		// creating hash id - ex: PL_team_334
		redis_hash_identifier = `${league}_team_${team.id || team.code || team.shortName}`;

		// reduce each key/value pair to an array of key/values to save to redis as a hashed set
		_team = _.reduce(team, (result, val, key) => {

			// only return key/val if val is of type string - b/c there's an object _link in there
			return typeof val === 'string' ? [...result, key, val] : result;

		}, [redis_hash_identifier]);

		// push _team to mappedTeams list
		mappedTeams.push( _team );

		// get players for this team
		_axios.get( team._links.players.href )
			  .then( ({ data }) => _savePlayersToTeam({ data }) )
			  .catch(err => { leftOverTeamsURL.push( err.config.url ); });
	});

	setTimeout(() => {

		console.log('------------------------ second group');

		leftOverTeamsURL.forEach(url => {

			_axios.get(url)
				 .then(({ data }) => _savePlayersToTeam({ data }))
				 .catch(err => { 
				 	_.get(err, 'config.url') && secondLeftOverTeamsURL.push( err.config.url ); 
				 });

		});

	}, (1100 * 60)); // 1min 5sec

	setTimeout(() => {
		console.log('------------------------ third group');

		secondLeftOverTeamsURL.forEach(url => {

			_axios.get(url)
				 .then(({ data }) => _savePlayersToTeam({ data }))
				 .catch(err => { console.log('err in secondLeftOverTeamsURL: ',  err.config.url ); });

		});

	}, (1100 * 120));

	// for each mapped team, add to redis as hash set
	mappedTeams.forEach( team => {
		// console.log('team: ', team);
		team.length > 0 && _redis.hmset(...team)
	});
}

const _savePlayersToTeam = ({ data }) => {
	const mappedPlayers = [];
	let _player = '',
		redis_hash_identifier = '';

	const team_id = data._links.team.href.split('/').reverse()[0];

	// stringify each player obj and add tomappedPlayers 
	data.players.forEach(player => {

		// add team id prop
		player.team_id = team_id;
		player.id = ''+(mappedPlayers.length + 1);

		// creating hash id - ex: PL_team_BAR || Barcelona || 1
		redis_hash_identifier = `team_${team_id}_player_${player.id}`;

		// reduce each key/value pair to an array of key/values to save to redis as a hashed set
		_player = _.reduce(player, (result, val, key) => {

			// only return key/val if val is of type string - b/c there's an object _link in there
			return typeof val === 'string' ? [...result, key, val] : result;

		}, [redis_hash_identifier]);

		mappedPlayers.push( _player );

	})

	// add players to redis as hash set team by id
	console.log('num of players: ', mappedPlayers.length);

	if( mappedPlayers.length > 0 )
		mappedPlayers.forEach( player => {
			console.log('player: ', player);
			player.length > 1 && _redis.hmset( ...player ) 
		});

	console.log('done saving players');
}

module.exports = { _initDataIfDBIsEmpty };









