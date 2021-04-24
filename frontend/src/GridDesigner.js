import 'fontsource-roboto';
import "ol/ol.css"

import React, { useState } from 'react';
import Map from "./Map";
import { Layers, TileLayer, DesignLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { BuildingContainer, } from './BuildingMenu';
import { fromLonLat } from 'ol/proj';
import { makeStyles } from '@material-ui/core/styles';
import { Header } from "./Common"




const useStyles = makeStyles((theme) => ({
    GridDesigner: {
        height: '100%',
        width: '100%',
    },
    Content: {
        height: '92%',
        width: '98%',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        overflow: "hidden",
        display: 'flex',
        flexDirection: 'row'
    },
    olMap: {
        flex: 7,
        overflow: "hidden"
    },
}));

const GridDesigner = () => {

    const [center, setCenter] = useState([-3.92907, 38.98626]);
    const [zoom, setZoom] = useState(18);
    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <Header title="Grid designer" > </Header>
            <div className={classes.Content}>
                <Map center={fromLonLat(center)} zoom={zoom} style={classes.olMap}>
                    <Layers>
                        <TileLayer
                            source={osm()}
                            zIndex={0}
                        />
                        <DesignLayer renderZoom={17} centerSetter={setCenter} />
                    </Layers>
                    <Controls>
                        <FullScreenControl />
                        <ZoomControl />
                    </Controls>
                </Map>
                <BuildingContainer centerSetter={setCenter} zoomSetter={setZoom} />
            </div>
        </div >
    )
};

export default GridDesigner;
