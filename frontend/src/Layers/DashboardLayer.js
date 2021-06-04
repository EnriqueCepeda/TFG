import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import MapContext from "../Map/MapContext";
import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { useSelector, useDispatch } from 'react-redux';
import { wsConnect, wsDisconnect, } from '../redux/actions/buildingActions';
import { getBuilding, getBuildings } from '../redux/selectors';
import clsx from 'clsx';
import { Fill, Stroke, Style } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, Card, CardHeader, CardContent, Collapse, Typography } from '@material-ui/core';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';

let buildingStyles = {
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
    'profit': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(4,102,0)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(235,255,235,0.7)',
        }),
    }),
    'deficit': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(220,64,64)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255,220,220, 0.5)',
        }),
    }),
    'error': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(20,64,64)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255,255,255,0.7)',
        }),
    }),
    'brokeEven': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(0,95,212)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(231,241,255, 0.5)',
        }),
    }),
}

let usePopupStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 345,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
}));

const Popup = ({ buildingId, popupRef, closeHandler, }) => {
    const selectedBuilding = useSelector(state => getBuilding(state, buildingId));
    const classes = usePopupStyles();
    const [expanded, setExpanded] = useState(false)

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card id="popup" ref={popupRef} className={classes.root} style={{ display: buildingId ? 'block' : 'none' }}>
            {selectedBuilding &&
                (<React.Fragment>
                    <CardHeader
                        id="popup-header"
                        title={buildingId}
                        subheader={selectedBuilding.type}
                        action={
                            <IconButton aria-label="settings" onClick={closeHandler}>
                                <CloseSharpIcon />
                            </IconButton>
                        }>

                    </CardHeader>
                    <CardContent id="popup-content"> Más contenido </CardContent>

                    < IconButton
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>

                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                            <Typography paragraph>More text</Typography>
                        </CardContent>
                    </Collapse>


                </React.Fragment>)

            }
        </Card >);


};

const DashboardLayer = () => {

    let popupRef = useRef(null);
    let [overlay, setOverlay] = useState(null);
    const { map } = useContext(MapContext);
    const buildings = useSelector(getBuildings);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const host = "ws://127.0.0.1:8000/api/v1/grid/open_connection";
    const dispatch = useDispatch();

    function popupCloseHandler() {
        overlay.setPosition(undefined);
    }




    useEffect(() => {
        if (!map) return;

        var geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857',
                },
            },
            'features': [

            ]
        }
        console.log(JSON.stringify(buildings));
        Object.keys(buildings).map((dictkey, index) => {
            var feature = {
                'id': dictkey,
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [buildings[dictkey].flatCoordinates]
                }
            }
            geojsonObject.features.push(feature)
        });

        let source = new VectorSource({
            features: new GeoJSON().readFeatures(geojsonObject)
        });

        setBuildingsStyle(source);
        let vectorLayer = new OLVectorLayer({
            source: source,
            style: buildingStyles.default,
        });

        map.addLayer(vectorLayer);
        return () => {
            if (map) {
                map.removeLayer(vectorLayer);
            }
        };
    }, [map]);

    useEffect(() => {
        if (!map) return;
        let overlay = new Overlay({
            element: popupRef.current,
            autoPan: true,
            autoPanAnimation: {
                duration: 750,
            },
        });
        map.addOverlay(overlay)
        map.on('click', function (event) {
            var featureClicked = false;
            map.forEachFeatureAtPixel(event.pixel, function (feature) {
                var coordinates = event.coordinate
                featureClicked = true;
                setSelectedBuildingId(feature.getId())
                overlay.setPosition(coordinates);
            })
            if (!featureClicked) {
                overlay.setPosition(undefined);
            }
        });
        setOverlay(overlay)
        connectToWebsocket();
        return () => {
            if (map) {
                map.removeOverlay(overlay)
                disconnectToWebsocket()
            }
        }


    }, [map])

    function connectToWebsocket() {
        dispatch(wsConnect(host));
    }

    function disconnectToWebsocket() {
        dispatch(wsDisconnect(host));
    }


    function setBuildingsStyle(source) {
        Object.keys(buildings).map((dictkey, index) => {
            var feature = source.getFeatureById(dictkey);
            switch (buildings[dictkey].type) {
                case "Consumer":
                    feature.setStyle(buildingStyles.deficit);
                    break;
                case "Producer":
                    feature.setStyle(buildingStyles.profit);
                    break;
                case "Prosumer":
                    feature.setStyle(buildingStyles.brokeEven);
                    break;
                default:
                    feature.setStyle(buildingStyles.error);
                    break;
            }
        });
    }

    return (<Popup buildingId={selectedBuildingId} popupRef={popupRef} closeHandler={popupCloseHandler} />);


};


export default DashboardLayer;