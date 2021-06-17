import React, { useState } from 'react';
import { makeStyles, Divider, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getProducerBuildings } from '../redux/selectors/buildingSelectors';
import { ContainerScrollbar, PurpleButton } from "../Common"
import BuildingDataCard from './BuildingDataCard';
import { PanelSelector } from './PanelSelector';


const useStyles = makeStyles(() => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10
    },
    panelContainer: {
        flex: 10,
        display: 'flex',
        flexDirection: "column",
        marginRight: 10,
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center"

    },
    buildingList: {
        display: 'flex',
        flexDirection: "column",
        flex: 2,
        minWidth: 250
    },
    card: {
        marginRight: 10,
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
    }
}));




export default function PanelContainer() {

    const classes = useStyles();
    const buildingList = useSelector(getProducerBuildings);
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    return (
        <div className={classes.root}>
            <div className={classes.buildingList}>
                <Typography variant="h5" align="center" style={{ marginBottom: 10 }}>PRODUCERS / PROSUMERS</Typography>
                <Divider variant="middle" />
                <ContainerScrollbar >
                    {
                        Object.keys(buildingList).map((dictkey, index) => (
                            <div key={dictkey} className={classes.card}>
                                <BuildingDataCard building_id={dictkey} selectedBuildingSetter={setSelectedBuilding} />
                            </div>
                        ))
                    }
                </ContainerScrollbar>
            </div>
            <Divider orientation="vertical" />
            <div className={classes.panelContainer}>
                <PanelSelector building_id={selectedBuilding} />
            </div>

        </div>
    );


}

