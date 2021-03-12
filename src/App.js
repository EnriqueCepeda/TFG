import React, { useState, useEffect } from 'react';
import "ol/ol.css"
import './App.css';
import Map from "./Map";
import { Layers, TileLayer, VectorLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { BuildingContainer, BuildingListContext } from './BuildingMenu';
import 'fontsource-roboto';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';


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

	const [center, setCenter] = useState([-3.92907, 38.98626]);
	const [zoom, setZoom] = useState(18);
	//{'1234': { latitude: "38.98626", longitude: "-3.92907", area: "200 m2" }}
	let [buildingList, setBuildingList] = useState({});

	return (
		<BuildingListContext.Provider value={[buildingList, setBuildingList]}>
			<div className="app">
				<Map center={fromLonLat(center)} zoom={zoom}>
					<Layers>
						<TileLayer
							source={osm()}
							zIndex={0}
						/>
						<VectorLayer
							defaultStyle={styles.Default} highlightStyle={styles.BuildingHighlight}
						/>
					</Layers>
					<Controls>
						<FullScreenControl />
						<ZoomControl />
					</Controls>
				</Map>
				<BuildingContainer>
				</BuildingContainer>
			</div>
		</BuildingListContext.Provider >
	)
};

export default App;
