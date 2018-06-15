import React from 'react';
import './app.css';

const CN = 'app';

export default class AppComponent extends React.Component {
	render() {
		return (
			<div className={`${CN}__container`}>
				Test
			</div>
		);
	}
}
