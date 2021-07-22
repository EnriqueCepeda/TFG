import 'fontsource-roboto';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import Map from "./Map";
import { Layers, TileLayer, DashboardLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { fromLonLat } from 'ol/proj';
import { PurpleTypography } from 'Common';
import CountUp from 'react-countup';
import _ from "lodash";
import { Typography } from '@material-ui/core';
import { Card } from '@material-ui/core';
import { getTotalConsumedEnergy, getTotalGeneratedEnergy, getConsumedEnergy, getGeneratedEnergy, getTotalLastHourConsumedEnergy, getTotalLastHourGeneratedEnergy, getGridConsumedEnergy, getGridGeneratedEnergy } from 'redux/selectors/buildingSelectors';
import { useSelector } from 'react-redux';


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
        flexWrap: "wrap",
        flexDirection: "row",
        marginBottom: 10,
        justifyContent: "space-evenly",
        alignItems: "center"

    },

    stat: {
        height: 75,
    }
}));


const GridStatistics = () => {


    const classes = useStatisticsStyles();
    const totalConsumedEnergy = useSelector(state => getTotalConsumedEnergy(state));
    const totalGeneratedEnergy = useSelector(state => getTotalGeneratedEnergy(state));
    const gridAgentConsumedEnergy = useSelector(state => getGridConsumedEnergy(state));
    const gridAgentGeneratedEnergy = useSelector(state => getGridGeneratedEnergy(state));
    const totalLastHourEnergyProduction = useSelector(state => getTotalLastHourGeneratedEnergy(state));
    const totalLastHourEnergyConsumption = useSelector(state => getTotalLastHourConsumedEnergy(state));;



    return (
        <Card className={classes.root} variant="outlined">
            <div>
                <Typography variant="h6" display="inline" align="center" > Last hour production </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={totalLastHourEnergyProduction} decimals={2} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Last hour consumption </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={totalLastHourEnergyConsumption} decimals={2} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Overall grid production </Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={totalGeneratedEnergy} decimals={2} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Overall grid consumption </Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={totalConsumedEnergy} decimals={2} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Energy from the supplier </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={gridAgentGeneratedEnergy} decimals={2} suffix="Kwh" /> </PurpleTypography>
            </div>
            <div>
                <Typography variant="h6" display="inline" align="center" > Shared energy with the supplier </ Typography >
                <PurpleTypography variant="h5" align="center"> <CountUp start={0} end={gridAgentConsumedEnergy} decimals={2} suffix="Kwh" /> </PurpleTypography>
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
