import React, { useRef, useState, useEffect } from "react"
import MapContext from "./MapContext";
import { View as olView, Map as olMap } from "ol";
import { Box } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	olMap: {
		flex: 7,
		overflow: "hidden"
	},
}));

const Map = ({ children, zoom, center }) => {
	const classes = useStyles();
	const mapRef = useRef();
	const [map, setMap] = useState(null);


	// on component mount
	useEffect(() => {
		let options = {
			view: new olView({ zoom, center }),
			layers: [],
			controls: [],
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
			<Box ref={mapRef} className={classes.olMap}>
				{children}
			</Box>
		</MapContext.Provider>
	)
}

export default Map;