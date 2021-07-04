import 'fontsource-roboto';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import Map from "./Map";
import { Layers, TileLayer, DashboardLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { fromLonLat } from 'ol/proj';
import { useSelector } from 'react-redux';
import { getBuildings } from 'redux/selectors';
import { PurpleTypography } from 'Common';
import CountUp from 'react-countup';
import _ from "lodash";
import { Typography } from '@material-ui/core';
import { Card } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        height: 'calc(100% - 84px)',
        margin: 10
    },
    olMap: {
        display: 'flex',
        flex: "auto",
    },
}));

const useStatisticsStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "row",
        height: 75,
        marginBottom: 10,
        justifyContent: "space-evenly",
        alignItems: "center"

    }
}));


const GridStatistics = () => {

    const buildingList = useSelector(getBuildings);
    const classes = useStatisticsStyles();



    return (
        <Card className={classes.root} variant="outlined">
            <div>
                <Typography variant="h6" display="inline" align="center" > Self-Consumption Rate  </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Self-Sufficiency Rate  </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Overall Balance  </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Hour Balance   </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Grid Agent Sent Energy  </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Grid Agent Received Energy </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={0} suffix="Kwh" /> </PurpleTypography>
            </div>


        </Card>



    );


}



const GridDashboard = () => {

    const classes = useStyles();
    const center = [-3.92907, 38.98626];
    const zoom = 18;

    return (
        <div className={classes.root}>
            <GridStatistics />
            <Map style={classes.olMap} center={fromLonLat(center)} zoom={zoom}>
                <Layers>
                    <TileLayer
                        source={osm()}
                        zIndex={0}
                    />
                    <DashboardLayer />
                </Layers>
                <Controls>
                    <FullScreenControl />
                    <ZoomControl />
                </Controls>
            </Map>
        </div >
    )
};

export default GridDashboard;
