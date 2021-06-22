import 'fontsource-roboto';
import "ol/ol.css"

import React, { useState } from 'react';
import Map from "./Map";
import { Layers, TileLayer, DesignLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { BuildingContainer, } from './BuildingMenu';
import { fromLonLat } from 'ol/proj';
import { makeStyles } from '@material-ui/core';



const useStyles = makeStyles((theme) => ({

    content: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100% - 84px)',
        flex: 1,
    },
    olMap: {
        flex: 7,
        alignItems: 'stretch'
    },
}));

const GridDesigner = () => {

    const [center, setCenter] = useState([-3.92907, 38.98626]);
    const [zoom, setZoom] = useState(18);
    const classes = useStyles();

    return (
        <React.Fragment>
            <div className={classes.content}>
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
        </React.Fragment >
    )
};

export default GridDesigner;
