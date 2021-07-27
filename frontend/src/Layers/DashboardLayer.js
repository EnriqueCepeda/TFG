import React, { useContext, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch, useStore } from 'react-redux';
import axios from 'axios';

import OLVectorLayer from "ol/layer/Vector";
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';

import { useInterval } from '../Common'
import { getBuilding, getBuildings } from '../redux/selectors';
import { addGrid } from '../redux/actions/gridActions';
import { addTransaction, removeGridData } from '../redux/actions/buildingActions';
import MapContext from "../Map/MapContext";




import { makeStyles, Card, CardHeader, CardContent, CardActions, Collapse, Divider, Typography, Box } from '@material-ui/core';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import PurpleTypography from "Common/PurpleTypography";

import CountUp from "react-countup"
import clsx from 'clsx';
import { getGeneratedEnergy, getConsumedEnergy, getLastHourConsumedEnergy, getLastHourGeneratedEnergy, } from "redux/selectors/buildingSelectors";
import _ from "lodash"


let buildingStyles = {
    'profit': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(38,64,39)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(166,255,71,0.5)',
        }),
    }),
    'deficit': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(102,0,0)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(239,98,108, 0.5)',
        }),
    }),
    'brokeEven': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(95,70,138)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(222,192,241,0.5)',
        }),
    }),
}

let usePopupStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 465,
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

    },
    quantities: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly"
    },
    quantitiesItem: {

    }
}));

const Popup = ({ buildingId, popupRef, closeHandler, overallConsumedEnergy, overallGeneratedEnergy, lastHourConsumedEnergy, lastHourGeneratedEnergy }) => {
    const selectedBuilding = useSelector(state => getBuilding(state, buildingId));
    const classes = usePopupStyles();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const getBuildingTransactions = (timestamp, transaction) => {
        if (transaction[1] > 0) {
            if (transaction[0] === buildingId) {
                return (<React.Fragment>
                    <Typography display="inline"> {timestamp + " | "}  </Typography>
                    <PurpleTypography display="inline"> {transaction[1].toFixed(2) + " Kwh"} </PurpleTypography>
                    <Typography display="inline"> {"from "}  </Typography>
                    <PurpleTypography display="inline"> {"itself"} </PurpleTypography>
                </React.Fragment>);

            } else {
                return (<React.Fragment>
                    <Typography display="inline"> {timestamp + " | "}  </Typography>
                    <PurpleTypography display="inline"> {transaction[1].toFixed(2) + " Kwh"} </PurpleTypography>
                    <Typography display="inline"> {"from "}  </Typography>
                    <PurpleTypography display="inline"> {transaction[0]} </PurpleTypography>
                </React.Fragment>);
            }

        } else {
            if (transaction[0] === buildingId) {
                return (<React.Fragment>
                    <Typography display="inline"> {timestamp + " | "}  </Typography>
                    <PurpleTypography display="inline"> {(-(transaction[1])).toFixed(2) + " Kwh"} </PurpleTypography>
                    <Typography display="inline"> {"to "}  </Typography>
                    <PurpleTypography display="inline" > {"itself"} </PurpleTypography>
                </React.Fragment>);

            } else {
                return (<React.Fragment>
                    <Typography display="inline"> {timestamp + " | "}  </Typography>
                    <PurpleTypography display="inline"> {(-(transaction[1])).toFixed(2) + " Kwh"} </PurpleTypography>
                    <Typography display="inline"> {"to "}  </Typography>
                    <PurpleTypography display="inline" > {transaction[0]} </PurpleTypography>
                </React.Fragment>);

            }

        }
    }

    const getBuildingStatistics = (lastHourConsumedEnergy, lastHourGeneratedEnergy, overallGeneratedEnergy, overallConsumedEnergy) => {
        if (selectedBuilding.type === "Prosumer") {
            return (
                <React.Fragment>
                    <div>
                        <Typography variant="h6" display="inline" align="center" > Last hour generation </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={lastHourGeneratedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>

                    <div>
                        <Typography variant="h6" display="inline" align="center" > Generation  </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={overallGeneratedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>
                    <div>
                        <Typography variant="h6" display="inline" align="center" > Last hour consumption </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={lastHourConsumedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>
                    <div>
                        <Typography variant="h6" display="inline" align="center" > Consumption  </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={overallConsumedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>
                </React.Fragment>
            )
        } else if (selectedBuilding.type === "Producer") {
            return (<React.Fragment>
                <div>
                    <Typography variant="h6" display="inline" align="center" > Last hour generation </ Typography >
                    <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={lastHourGeneratedEnergy} suffix="Kwh" /> </PurpleTypography>
                </div>

                <div>
                    <Typography variant="h6" display="inline" align="center" > Generation  </ Typography >
                    <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={overallGeneratedEnergy} suffix="Kwh" /> </PurpleTypography>
                </div>
            </React.Fragment>)
        } else {
            return (
                <React.Fragment>
                    <div>
                        <Typography variant="h6" display="inline" align="center" > Last hour consumption </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={lastHourConsumedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>
                    <div>
                        <Typography variant="h6" display="inline" align="center" > Consumption  </ Typography >
                        <PurpleTypography variant="h5" align="center"> <CountUp start={0} decimals={2} end={overallConsumedEnergy} suffix="Kwh" /> </PurpleTypography>
                    </div>
                </React.Fragment>)

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
                    <CardContent>
                        <div className={classes.quantities}>
                            {getBuildingStatistics(lastHourConsumedEnergy, lastHourGeneratedEnergy, overallGeneratedEnergy, overallConsumedEnergy)}

                        </div>
                    </CardContent>
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
                                Object.keys(selectedBuilding.transactions).map((timestamp) => (
                                    selectedBuilding.transactions[timestamp].map((transaction) => (
                                        <React.Fragment key={timestamp}>
                                            {getBuildingTransactions(timestamp, transaction)}
                                            <br />
                                        </React.Fragment>
                                    )
                                    )
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
    const { map } = useContext(MapContext);
    let [overlay, setOverlay] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [lastEpochCheck, setLastEpochCheck] = useState(null);
    const [isActive, setActive] = useState(false);

    const buildings = useSelector(getBuildings);
    const store = useStore();
    const dispatch = useDispatch();

    const ms_delay = 5000;
    const overallConsumedEnergy = useSelector(state => getConsumedEnergy(state, selectedBuildingId))
    const overallGeneratedEnergy = useSelector(state => getGeneratedEnergy(state, selectedBuildingId))
    const lastHourConsumedEnergy = useSelector(state => getLastHourConsumedEnergy(state, selectedBuildingId))
    const lastHourGeneratedEnergy = useSelector(state => getLastHourGeneratedEnergy(state, selectedBuildingId))

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
        Object.keys(buildings).map((dictkey) => {
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
    }, [map, buildings]);


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
            dispatch(removeGrid());
        }
    }, []);


    useInterval(() => {
        dispatch(askForNonFetchedTransactions());
    }, isActive ? ms_delay : null);

    const launchGrid = () => (
        () => {
            let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
            let requestBody = {
                'userTimeZone': userTimeZone,
                'buildings': buildings
            }
            let request_url = "http://localhost:8000/api/v1/grid/";
            axios.post(request_url, requestBody).then(res => res.data.id).then(grid_id => { dispatch(addGrid(grid_id)) });
            setLastEpochCheck(Date.now())

        }
    )

    const askForNonFetchedTransactions = () => (
        () => {
            var gridId = store.getState().grid.id
            let request_url = `http://localhost:8000/api/v1/grid/${gridId}/transactions/${lastEpochCheck}`;
            axios.get(request_url).then(res => res.data).then(transactions => transactions.map((transaction) => {
                dispatch(addTransaction(transaction.sender, transaction.receiver, transaction.energy, transaction.timestamp, transaction.grid_timestamp))
            }));
            setLastEpochCheck(Date.now())
        }
    )


    const removeGrid = () => (

        () => {
            var gridId = store.getState().grid.id
            let request_url = `http://localhost:8000/api/v1/grid/${gridId}/`;
            axios.delete(request_url).then(console.log("Grid " + gridId + " removed"));
            dispatch(removeGridData())
        }
    )



    const getEnergyBalance = (selectedBuilding) => {
        var values = []
        Object.values(selectedBuilding.transactions).forEach((hourTransactions) => (
            hourTransactions.forEach((transaction) => {
                values.push(transaction[1]);
            })));
        return _.sum(values);

    }


    function setBuildingsStyle(source) {
        Object.entries(buildings).map(([buildingId, building]) => {
            var feature = source.getFeatureById(buildingId);
            var buildingBalance = getEnergyBalance(building)
            if (buildingBalance > 0) {
                feature.setStyle(buildingStyles.deficit);
            } else if (buildingBalance < 0) {
                feature.setStyle(buildingStyles.profit);
            } else {
                feature.setStyle(buildingStyles.brokeEven);
            }
        });
    }

    return (<Popup buildingId={selectedBuildingId} popupRef={popupRef} closeHandler={popupCloseHandler}
        overallConsumedEnergy={overallConsumedEnergy}
        overallGeneratedEnergy={overallGeneratedEnergy}
        lastHourConsumedEnergy={lastHourConsumedEnergy}
        lastHourGeneratedEnergy={lastHourGeneratedEnergy} />);


};


export default DashboardLayer;