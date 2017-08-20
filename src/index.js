// /src/index.js

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, BrowserRouter, IndexRoute } from 'react-router-dom'

//store
import Team from './Team'
import store from './store'

render((

	<Provider store={ store }>
		<BrowserRouter>
			<Route path="/" component={ Team } />
	    </BrowserRouter>
    </Provider>

), document.getElementById('_Top11'));