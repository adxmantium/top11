// /server/socketEvents.js

module.exports = {

	connect: ({ socket }) => {
		console.log('connected: ', socket.id);
	},

	disconnect: ({ socket }) => {
		console.log('disconnected!');
	}

}