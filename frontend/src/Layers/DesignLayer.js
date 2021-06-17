import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import proj4 from "proj4";
import axios from 'axios';

import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { transformExtent } from 'ol/proj';
import { getArea } from 'ol/sphere';
import OSMXML from 'ol/format/OSMXML';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { toLonLat } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';


import MapContext from "../Map/MapContext";
import { addBuilding, removeBuilding, updateBuildingAddress, updateBuildingMaxPanels } from '../redux/actions/buildingActions';
import { getBuildings } from '../redux/selectors';


let styles = {
	'default': new Style({
		zIndex: 1,
		stroke: new Stroke({
			color: 'rgba(246, 207, 101, 1.0)',
			width: 1,
		}),
		fill: new Fill({
			color: 'rgba(255, 242, 175, 0.5)',
		}),
	}),
	'highlight': new Style({
		zIndex: 2,
		stroke: new Stroke({
			color: 'rgb(95,70,138)',
			width: 2,
		}),
		fill: new Fill({
			color: 'rgba(255,255,255,0.7)',
		}),
	}),
};

const DesignLayer = ({ renderZoom, centerSetter, zIndex = 1 }) => {
	const { map } = useContext(MapContext);
	const buildings = useSelector(getBuildings);
	const dispatch = useDispatch();
	const [firstMounted, setFirstMounted] = useState(true);

	let defaultStyle = styles.default;
	let highlightStyle = styles.highlight;

	useEffect(() => {
		if (!map) return;

		setFirstMounted(false);
		let source = new VectorSource({
			format: new OSMXML(),
			loader: function (extent, resolution, projection) {
				let epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
				let request_url = 'https://overpass-api.de/api/interpreter';
				let extended_load_percentage = 0.02;
				let stringExtent = (epsg4326Extent[1] - epsg4326Extent[1] * extended_load_percentage) + ',' + (epsg4326Extent[0] * extended_load_percentage + epsg4326Extent[0]) + ',' +
					(epsg4326Extent[3] * extended_load_percentage + epsg4326Extent[3]) + ',' + (epsg4326Extent[2] - epsg4326Extent[2] * extended_load_percentage);
				let query = "(way[building](" + stringExtent + ");); out meta; >; out meta qt;"
				axios.post(request_url, query).then(response => {
					var features = new OSMXML().readFeatures(response.data, {
						featureProjection: map.getView().getProjection(),
					});
					source.addFeatures(features);
					if (firstMounted) {
						reloadSelectedItems(source);
					}
				})
			},
			strategy: bboxStrategy,
		});


		let vectorLayer = new OLVectorLayer({
			source: source,
			style: defaultStyle,
			minZoom: renderZoom
		});
		map.addLayer(vectorLayer);
		vectorLayer.setZIndex(zIndex);


		return () => {
			if (map) {
				map.removeLayer(vectorLayer);
			}
		};
	}, [map]);


	useEffect(() => {
		if (!map) return;
		map.addEventListener('singleclick', modifyBuildingListListener);
		return () => {
			if (map) {
				map.removeEventListener('singleclick', modifyBuildingListListener);
			}
		};
	}, [map, buildings]);

	function reloadSelectedItems(source) {
		Object.keys(buildings).map((dictkey, index) => {
			var feature = source.getFeatureById(getOriginalId(dictkey));
			if (feature !== null) {
				feature.setStyle(highlightStyle);
			}
		});
	}

	function getOriginalId(string) {
		return string.replace("Building ", "")
	}

	function getPolygonCoordinates(coordinates) {
		var newCoordinates = [];
		coordinates.map(element => {
			var latloncoordinates = proj4('EPSG:3857', 'WGS84', [element[0], element[1]])
			newCoordinates.push(latloncoordinates);
		})
		return newCoordinates;
	}

	const fetchBuildingAddress = (latitude, longitude, building_id) => (
		() => {
			let request_url = `http://localhost:8000/api/v1/building/address?latitude=${latitude}&longitude=${longitude}`
			axios.get(request_url).then(res => res.data.response).then(address => { dispatch(updateBuildingAddress(building_id, address)) });
		})

	const fetchMaxPanels = (building_id, latitude, coordinates) => (
		() => {
			let request_url = `http://localhost:8000/api/v1/building/configuration?latitude=${latitude}`
			let request_body = coordinates
			axios.post(request_url, request_body).then(res => res.data.panels).then(panels => { dispatch(updateBuildingMaxPanels(building_id, panels)) });
		})


	function modifyBuildingListListener(e) {
		map.forEachFeatureAtPixel(e.pixel, function (feature) {
			var keys = Object.keys(buildings);
			var buildingOlId = "Building " + feature.getId();
			var selIndex = keys.indexOf(buildingOlId);
			centerSetter(toLonLat(map.getView().getCenter()));
			if (selIndex < 0) {
				debugger;
				var interiorCoordinates = feature.getGeometry().getInteriorPoint().getCoordinates();
				var lonLatCoordinates = toLonLat([interiorCoordinates[0], interiorCoordinates[1]]);
				var latitude = lonLatCoordinates[1];
				var longitude = lonLatCoordinates[0];
				var area = getArea(feature.getGeometry()).toFixed(2);
				var coordinates = getPolygonCoordinates(feature.getGeometry().getCoordinates()[0]);
				let address = `Latitude: ${latitude.toFixed(8)} \n Longitude: ${longitude.toFixed(8)}`
				var flatCoordinates = feature.getGeometry().getCoordinates()[0];
				feature.setStyle(highlightStyle);
				dispatch(addBuilding(buildingOlId, latitude, longitude, address, area, coordinates, flatCoordinates));
				dispatch(fetchBuildingAddress(latitude, longitude, buildingOlId));
				dispatch(fetchMaxPanels(buildingOlId, latitude, coordinates))
			} else {
				feature.setStyle(defaultStyle);
				dispatch(removeBuilding(buildingOlId));

			}
		});

	}

	return null;
};


export default DesignLayer;