import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { transformExtent } from 'ol/proj';
import { getArea } from 'ol/sphere';
import OSMXML from 'ol/format/OSMXML';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { toLonLat } from 'ol/proj';
import { useSelector, useDispatch } from 'react-redux';
import { addBuilding, removeBuilding } from '../redux/actions/buildingActions';
import { getBuildings } from '../redux/selectors';
import proj4 from "proj4";
import { Fill, Stroke, Style } from 'ol/style';



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
	let defaultStyle = styles.default;
	let highlightStyle = styles.highlight;

	useEffect(() => {
		if (!map) return;

		let source = new VectorSource({
			format: new OSMXML(),
			loader: function (extent, resolution, projection) {
				var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
				var client = new XMLHttpRequest();
				client.open('POST', 'https://overpass-api.de/api/interpreter');
				client.addEventListener('load', function () {
					var features = new OSMXML().readFeatures(client.responseText, {
						featureProjection: map.getView().getProjection(),
					});
					source.addFeatures(features);
					reloadSelectedItems(source)
				});
				var extended_load_percentage = 0.02;
				var stringExtent = (epsg4326Extent[1] - epsg4326Extent[1] * extended_load_percentage) + ',' + (epsg4326Extent[0] * extended_load_percentage + epsg4326Extent[0]) + ',' +
					(epsg4326Extent[3] * extended_load_percentage + epsg4326Extent[3]) + ',' + (epsg4326Extent[2] - epsg4326Extent[2] * extended_load_percentage);
				var query = "(way[building](" + stringExtent + ");); out meta; >; out meta qt;"
				client.send(query);
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

	function modifyBuildingListListener(e) {
		map.forEachFeatureAtPixel(e.pixel, function (feature) {
			var keys = Object.keys(buildings);
			var buildingOlId = "Building " + feature.getId();
			var selIndex = keys.indexOf(buildingOlId);
			debugger;
			centerSetter(toLonLat(map.getView().getCenter()));
			if (selIndex < 0) {
				var coordinates = feature.getGeometry().getInteriorPoint().getCoordinates();
				var lonLatCoordinates = toLonLat([coordinates[0], coordinates[1]]);
				var latitude = lonLatCoordinates[0];
				var longitude = lonLatCoordinates[1];
				var area = getArea(feature.getGeometry()).toFixed(2);
				var Coordinates = getPolygonCoordinates(feature.getGeometry().getCoordinates()[0])
				var FlatCoordinates = feature.getGeometry().getCoordinates()[0]
				dispatch(addBuilding(buildingOlId, latitude, longitude, area, Coordinates, FlatCoordinates));
				feature.setStyle(highlightStyle);
			} else {
				dispatch(removeBuilding(buildingOlId));
				feature.setStyle(defaultStyle);

			}
		});

	}

	return null;
};


export default DesignLayer;