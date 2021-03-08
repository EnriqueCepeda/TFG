import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { transformExtent } from 'ol/proj';
import OSMXML from 'ol/format/OSMXML';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

const VectorLayer = ({ style, zIndex = 1 }) => {
	const { map } = useContext(MapContext);

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

	useEffect(() => {
		if (!map) return;

		let vectorLayer = new OLVectorLayer({
			source,
			style
		});

		map.addLayer(vectorLayer);
		vectorLayer.setZIndex(zIndex);

		return () => {
			if (map) {
				map.removeLayer(vectorLayer);
			}
		};
	}, [map]);

	return null;
};

export default VectorLayer;