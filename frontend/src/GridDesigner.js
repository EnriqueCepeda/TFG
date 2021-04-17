import 'fontsource-roboto';
import "ol/ol.css"

import React, { useState } from 'react';
import Map from "./Map";
import { Layers, TileLayer, VectorLayer } from "./Layers";
import { osm } from "./Source";
import { Controls, FullScreenControl, ZoomControl } from "./Controls";
import { BuildingContainer, } from './BuildingMenu';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';
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
    }
}));


let styles = {
    'Default': new Style({
        zIndex: 1,
        stroke: new Stroke({
            color: 'rgba(246, 207, 101, 1.0)',
            width: 1,
        }),
        fill: new Fill({
            color: 'rgba(255, 242, 175, 0.5)',
        }),
    }),
    'BuildingHighlight': new Style({
        zIndex: 2,
        stroke: new Stroke({
            color: 'rgb(95,70,138)',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255,255,255,0.7)',
        }),
    }),
};


const GridDesigner = () => {

    const [center, setCenter] = useState([-3.92907, 38.98626]);
    const [zoom, setZoom] = useState(18);
    const classes = useStyles();

    return (
        <div className={classes.GridDesigner}>
            <Header title="Grid designer" > </Header>
            <div className={classes.Content}>
                <Map center={fromLonLat(center)} zoom={zoom}>
                    <Layers>
                        <TileLayer
                            source={osm()}
                            zIndex={0}
                        />
                        <VectorLayer
                            defaultStyle={styles.Default} highlightStyle={styles.BuildingHighlight} renderZoom={17} centerSetter={setCenter}
                        />
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
