import React, { useState } from 'react';
import GridDesigner from './GridDesigner'
import GridDetail from './GridDetail'
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from "react-router-dom";


export default function App() {
	return (
		<Router>
			<Switch>
				<Route path="/detail">
					<GridDetail />
				</Route>
				<Route path="/">
					<GridDesigner />
				</Route>
			</Switch>
		</Router>
	);
}