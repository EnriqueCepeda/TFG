import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { transformExtent } from 'ol/proj';
import OSMXML from 'ol/format/OSMXML';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import BuildingListContext from "../BuildingMenu/BuildingListContext";

const VectorLayer = ({ defaultStyle, highlightStyle, zIndex = 1 }) => {
	const { map } = useContext(MapContext);
	let [buildingList, setBuildingList] = useContext(BuildingListContext);

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
			style: defaultStyle
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
			var keys = Object.keys(buildingList);
			var buildingOlId = f.ol_uid;
			var selIndex = keys.indexOf(buildingOlId);
			var buildingListClone = Object.assign({}, buildingList);
			if (selIndex < 0) {
				var latitude = f.getGeometry().getInteriorPoint().getCoordinates()[0];
				var longitude = f.getGeometry().getInteriorPoint().getCoordinates()[1];
				var area = f.getGeometry().getArea();
				buildingListClone[buildingOlId] = { 'latitude': latitude, 'longitude': longitude, 'area': area };
				f.setStyle(highlightStyle);
				setBuildingList(buildingListClone);
			} else {
				f.setStyle(defaultStyle);
				delete buildingListClone[buildingOlId]
				setBuildingList(buildingListClone);

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
	}, [map, buildingList]);

	return null;
};


export default VectorLayer;