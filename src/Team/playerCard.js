// /src/Team/playerCard.js

import React from 'react'

export default ({ onClick, ...player }) => {

	const { name, position, crestUrl } = player;

	return (

		<div 
			className="player-card" 
			style={{backgroundImage: `url(${crestUrl})`}}
			onClick={ () => onClick && onClick({ player }) }>

			<div className="badge-layer" />

			<div className="info">
				<div className="name">{ name }</div>
				<div className="position">{ position }</div>
			</div>

		</div>

	)
}