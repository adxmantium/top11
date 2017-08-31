// /src/PlayerSearchContainer/index.js

import React from 'react'

export default ({ onClick, ...player }) => (

	<div 
		className="player-result" 
		onClick={ () => onClick && onClick({ player }) }>

			{ player.name }

	</div>

)