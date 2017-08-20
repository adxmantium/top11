// /me/src/store.js

import thunk from 'redux-thunk'
import { logger } from 'redux-logger'
import promise from 'redux-promise-middleware'
import { createStore, applyMiddleware, combineReducers } from 'redux'

// Reducers
import _app from './reducers'

//create and combine middleware
// -- dev 
const middleware = applyMiddleware(thunk, promise(), logger);

// -- production
// const middleware = applyMiddleware(thunk, promise());

//combine all reducers
const reducers = combineReducers({
	_app
});

// Create Store
const store = createStore(reducers, middleware);

export default store;