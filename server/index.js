// /server/index.js

// COMMAND TO START TOP11 REDIS INSTANCE: redis-server /usr/local/etc/redis-top11.conf

const _ = require('lodash')
const axios = require('axios')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')
const socketEvents = require('./socketEvents')
const footballData = require('./footballData')

// constants
const REDIS_PORT = 6412;
const REDIS_HOST = 'localhost';
// const REDIS_PASS = 'redisisinmemory';

// init redis client !! must run redis-server to start redis else error will be thrown
const _redis = redis.createClient({
	host: REDIS_HOST, 
	port: REDIS_PORT, 
	// password: REDIS_PASS,
});

// constants
const APP_PORT = 3211;

// init app
const app = express();
const server = require('http').createServer(app);
const COMPETITION_API = 'http://api.football-data.org/v1/competitions/?season=2017';

// socket.io
const io = require('socket.io')(server);

// apply middleware
app.use( bodyParser.json() ); // will find parsed json in res.body
app.use( bodyParser.urlencoded({ extended: false }) ); // will find parsed urlencoded in res.body
app.use('/', express.static(__dirname + '/../public'));
app.listen(APP_PORT, () => console.log(`Example app listening on port ${APP_PORT}!`) );

app.get('/teams', (req, res) => {
	const allTeams = [],
		  allPlayers = [];

	let reducedPlayerKeys = [],
		end_of_leagues = false,
		end_of_teams = false,
		end_of_players = false,
		newPlayerHashKeys = null;

	// get leagues from set of leagues in redis
	_redis.smembers('leagues', (err, leagues) => {

		// get teams from each league
		leagues.forEach((league, l, leagueArr) => {

			// get all keys that start with ${league}_team_ to get every team key
			_redis.keys(`${league}_team_*`, (err, teamHashKeys) => {

				// for each team hash set key
				teamHashKeys.forEach((key, t, teamArr) => {

					// get team hash from redis and add to list
					_redis.hgetall(key, (err, team) => {

						allTeams.push( team );

						// get player hash set keys for this team
						_redis.keys(`team_${team.id}_player*`, (err, playerHashKeys) => {

							newPlayerHashKeys = playerHashKeys;

							if( !newPlayerHashKeys.length ) newPlayerHashKeys = [''];

							// for player has set for each key
							newPlayerHashKeys.forEach((playerKey, p, playerArr) => {

								// get player hash set
								_redis.hgetall(playerKey, (err, player) => {

									// add player to list
									if( player ) allPlayers.push( player );

									// if this is the last player of the last team of the last league, then return allTeams and allPlayers
									if( (l+1) === leagueArr.length && (t+1) === teamArr.length && (p+1) === playerArr.length ){
										console.log('here?');
										res.send({ allTeams, allPlayers });
									} 

								})

							}) // end of playerHasKeys foreach

						}) // end of redis keys for players

					}); // end of redis hgetall for team

				})

			})

		})

	})
});

app.get('/top11', (req, res) => {
	const topPlayers = [];

	// get top 11 set
	_redis.smembers('positions', (err, topPlayerKeys) => {

		// for each key in top_11, get players
		topPlayerKeys.forEach((key, i, arr) => {

			// get player by key and add to array and on last player, return topPlayers
			_redis.hgetall(key, (err, positionKey) => {

				_redis.hgetall(positionKey.player, (err, player) => {

					// add saved position prop to this player
					player.saved_position = positionKey.position;
					player.player_key = positionKey.player;

					topPlayers.push( player );

					if( (i+1) === arr.length ) res.send({ topPlayers });

				})	

			})

		})

	})
})

app.get('/formations', (req, res) => {

	_redis.smembers('formation_types', (err, allFormations) => {

		_redis.get('favorite_formation', (err, type) => {

			_redis.smembers(type, (err, positions) => {

				const favoriteFormation = {
					type,
					positions,
				}

				res.send({ allFormations, favoriteFormation });

			})

		})

	})

})

// redis client on ready event listener
_redis.on('ready', () => {
	console.log(`Redis is up and running on port ${REDIS_PORT}`);
	// populate db with football data if empty
	footballData._initDataIfDBIsEmpty(_redis);
});

// redis client on error event listener
_redis.on('error', err => console.log('Redis error!! ', err));

// socket.io connection
io.on('connection', function(socket){
	
	console.log('connected! ', socket.id);	

	client.on('connect:user', () => socketEvents.connect({ socket }));

	client.on('disconnect', () => socketEvents.disconnect({ socket }));

});
