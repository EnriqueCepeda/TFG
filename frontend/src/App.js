import React from 'react';
import GridDesigner from './GridDesigner'
import GridDashboard from './GridDashboard'
import GridBuildingConsumption from './GridBuildingConsumption'
import GridBuildingPanels from './GridBuildingPanels'
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from "react-router-dom";


export default function App() {
	return (
		<Router>
			<Switch>
				<Route path="/dashboard" component={GridDashboard} />
				<Route path="/consumption" component={GridBuildingConsumption} />
				<Route path="/panels" component={GridBuildingPanels} />
				<Route path="/" component={GridDesigner} />
			</Switch>
		</Router >
	);
}
