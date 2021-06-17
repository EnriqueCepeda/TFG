import React, { useContext, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

import { useInterval } from '../Common'
import { getBuilding, getBuildings, getGridId } from '../redux/selectors';
import { addGrid } from '../redux/actions/gridActions';
import { addTransaction } from '../redux/actions/buildingActions';
import MapContext from "../Map/MapContext";




import { makeStyles, Card, CardHeader, CardContent, CardActions, Collapse, Divider, Typography, CardActionArea, withStyles } from '@material-ui/core';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';


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
    expandLine: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 5,
        marginRight: 5,

    }
}));

const PopupCardActionArea = withStyles({
    root: {
        '&:hover $focusHighlight': {
            opacity: 0.11,
        },
    },
    focusHighlight: {
        background: "#5f468a"
    }

})(CardActionArea);

const Popup = ({ buildingId, popupRef, closeHandler, }) => {
    const selectedBuilding = useSelector(state => getBuilding(state, buildingId));
    const classes = usePopupStyles();
    const [expanded, setExpanded] = useState(false)

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const getBuildingTransactions = (dictkey) => {
        if (selectedBuilding.transactions[dictkey][1] > 0) {
            return (<Typography> {dictkey + " | " + selectedBuilding.transactions[dictkey][1] + "Kw from " + selectedBuilding.transactions[dictkey][0]} </Typography>)
        } else {
            return (<Typography> {dictkey + " | " + (-selectedBuilding.transactions[dictkey][1]) + "Kw to " + selectedBuilding.transactions[dictkey][0]} </Typography>)
        }
    }

    return (
        <Card id="popup" ref={popupRef} className={classes.root} style={{ display: buildingId ? 'block' : 'none' }}>
            {selectedBuilding &&
                (<React.Fragment>
                    <CardHeader
                        id="popup-header"
                        title={selectedBuilding.address}
                        subheader={buildingId + " - " + selectedBuilding.type}
                        action={
                            <IconButton aria-label="settings" onClick={closeHandler}>
                                <CloseSharpIcon />
                            </IconButton>
                        }>

                    </CardHeader>
                    <Divider variant="middle" />
                    <CardActions disableSpacing className={classes.expandLine}>
                        <Typography variant="h6"> Transactions </Typography>
                        <IconButton
                            className={clsx(classes.expand, {
                                [classes.expandOpen]: expanded,
                            })}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show more"
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </CardActions>

                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                            {
                                Object.keys(selectedBuilding.transactions).map((dictkey, index) => (
                                    <React.Fragment key={dictkey}>
                                        {getBuildingTransactions(dictkey)}
                                    </React.Fragment>

                                ))
                            }

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
    const gridId = useSelector(getGridId);
    const dispatch = useDispatch();
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [lastEpochCheck, setLastEpochCheck] = useState(null);
    const [delay, setDelay] = useState(10000);
    const [isActive, setActive] = useState(false);

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
        return () => {
            if (map) {
                map.removeOverlay(overlay);
            }
        }


    }, [map])


    useEffect(() => {
        dispatch(launchGrid());
        setActive(true);
        return () => {
            setActive(false);
            removeGrid();
        }
    }, []);


    useInterval(() => {
        dispatch(askForNonFetchedTransactions());
    }, isActive ? delay : null);

    const launchGrid = () => (
        () => {
            let request_url = "http://localhost:8000/api/v1/grid/launch";
            axios.post(request_url, buildings).then(res => res.data.id).then(grid_id => { dispatch(addGrid(grid_id)) });
            setLastEpochCheck(Date.now())

        }
    )

    const askForNonFetchedTransactions = () => (
        () => {
            let request_url = `http://localhost:8000/api/v1/grid/${gridId}/transactions/${lastEpochCheck}`;
            axios.get(request_url).then(res => res.data).then(transactions => transactions.map((transaction) => {
                dispatch(addTransaction(transaction.sender, transaction.receiver, transaction.energy, transaction.timestamp))
            }));
            setLastEpochCheck(Date.now())
        }
    )


    function removeGrid() {
        let request_url = "http://localhost:8000/api/v1/grid/stop";
        axios.post(request_url).then(console.log("Grid stopped"))
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