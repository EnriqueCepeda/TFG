import "./Map.css"
import React, { useRef, useState, useEffect } from "react"
import MapContext from "./MapContext";
import { View as olView, Map as olMap } from "ol";
import { Box } from "@material-ui/core"

const Map = ({ children, zoom, center }) => {
	const mapRef = useRef();
	const [map, setMap] = useState(null);


	// on component mount
	useEffect(() => {
		let options = {
			view: new olView({ zoom, center }),
			layers: [],
			controls: [],
			overlays: []
		};
		let mapObject = new olMap(options);
		mapObject.setTarget(mapRef.current);
		setMap(mapObject);

		return () => mapObject.setTarget(undefined);
	}, []);

	// zoom change handler
	useEffect(() => {
		if (!map) return;

		map.getView().setZoom(zoom);
	}, [zoom]);

	// center change handler
	useEffect(() => {
		if (!map) return;

		map.getView().setCenter(center)
	}, [center])

	return (
		<MapContext.Provider value={{ map }}>
			<Box ref={mapRef} className="ol-map">
				{children}
			</Box>
		</MapContext.Provider>
	)
}

export default Map;