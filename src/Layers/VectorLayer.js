import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { transformExtent } from 'ol/proj';
import OSMXML from 'ol/format/OSMXML';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { toLonLat } from 'ol/proj';
import { useSelector, useDispatch } from 'react-redux'
import { addBuilding, removeBuilding } from '../redux/actions/buildingActions'

const VectorLayer = ({ defaultStyle, highlightStyle, renderZoom, centerSetter, zIndex = 1 }) => {
	const { map } = useContext(MapContext);
	const buildings = useSelector(state => state.buildings);
	const dispatch = useDispatch();

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


	function modifyBuildingListListener(e) {
		map.forEachFeatureAtPixel(e.pixel, function (f) {
			var keys = Object.keys(buildings);
			var buildingOlId = "Building " + f.ol_uid;
			var selIndex = keys.indexOf(buildingOlId);
			centerSetter(toLonLat(map.getView().getCenter()));
			if (selIndex < 0) {
				var coordinates = f.getGeometry().getInteriorPoint().getCoordinates();
				var lonLatCoordinates = toLonLat([coordinates[0], coordinates[1]]);
				var latitude = lonLatCoordinates[0].toFixed(4);
				var longitude = lonLatCoordinates[1].toFixed(4);
				var area = f.getGeometry().getArea().toFixed(2);
				dispatch(addBuilding(buildingOlId, latitude, longitude, area));
				f.setStyle(highlightStyle);
			} else {
				dispatch(removeBuilding(buildingOlId));
				f.setStyle(defaultStyle);

			}
		});

	}


	useEffect(() => {
		if (!map) return;
		map.addEventListener('singleclick', modifyBuildingListListener);
		return () => {
			if (map) {
				map.removeEventListener('singleclick', modifyBuildingListListener);
			}
		};
	}, [map, buildings]);

	return null;
};


export default VectorLayer;