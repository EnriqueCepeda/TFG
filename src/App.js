import React, { useState } from 'react';
import "ol/ol.css"
import './App.css';
import Map from "./Map";
import { Layers, TileLayer, VectorLayer } from "./Layers";
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { osm } from "./Source";
import { fromLonLat } from 'ol/proj';
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { BuildingCard, BuildingContainer } from './BuildingMenu';


let styles = {
	'Default': new Style({
		stroke: new Stroke({
			color: 'red',
			width: 1,
		}),
		fill: new Fill({
			color: 'rgba(255, 242, 175, 0.5)',
		}),
	}),
	'BuildingHighlight': new Style({
		fill: new Fill({
			color: 'rgba(255,255,255,0.7)',
		}),
		stroke: new Stroke({
			color: '#3399CC',
			width: 3,
		}),
	}),
};

const App = () => {
	const [center, setCenter] = useState([]);
	const [zoom, setZoom] = useState(18);
	return (
		<div className="app">
			<Map center={fromLonLat(center)} zoom={zoom}>
				<Layers>
					<TileLayer
						source={osm()}
						zIndex={0}
					/>
					<VectorLayer
						style={styles.Default}
					/>
				</Layers>
				<Controls>
					<FullScreenControl />
					<ZoomControl />
				</Controls>
			</Map>
			<BuildingContainer>
				<BuildingCard />
			</BuildingContainer>
		</div>
	)
};

export default App;
