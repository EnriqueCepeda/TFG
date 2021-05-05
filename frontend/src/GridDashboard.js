import 'fontsource-roboto';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Header } from "./Common";
import Map from "./Map";
import { Layers, TileLayer, DashboardLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { fromLonLat } from 'ol/proj'



const useStyles = makeStyles((theme) => ({
    olMap: {
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100% - 84px)',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
    },
}));


const GridDashboard = () => {

    const classes = useStyles();
    const [center, setCenter] = useState([-3.92907, 38.98626]);
    const [zoom, setZoom] = useState(18);

    return (
        <React.Fragment>
            <Header title="Dashboard" > </Header>
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
        </React.Fragment >
    )
};

export default GridDashboard;
