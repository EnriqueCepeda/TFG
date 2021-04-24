import React from 'react';
import GridDesigner from './GridDesigner'
import GridDashboard from './GridDashboard'
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
				<Route path="/detail" component={GridDetail} />
				<Route path="/dashboard" component={GridDashboard} />
				<Route path="/" component={GridDesigner} />
			</Switch>
		</Router >
	);
}
