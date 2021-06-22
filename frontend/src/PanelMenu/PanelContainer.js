import React, { useState } from 'react';
import { makeStyles, Divider, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getProducerBuildings } from '../redux/selectors/buildingSelectors';
import { ContainerScrollbar, PurpleButton, PurpleTypography } from "../Common"
import BuildingDataCard from './BuildingDataCard';
import { PanelSelector } from './PanelSelector';
import { Link } from 'react-router-dom';

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
        minWidth: 250,
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
                <PurpleTypography variant="h5" align="center" style={{ marginBottom: 10 }}>PRODUCERS / PROSUMERS</PurpleTypography>
                <Divider variant="middle" />
                <ContainerScrollbar autoHide>
                    {
                        Object.keys(buildingList).map((dictkey, index) => (
                            <div key={dictkey} className={classes.card}>
                                <BuildingDataCard building_id={dictkey} selectedBuildingSetter={setSelectedBuilding} />
                            </div>
                        ))
                    }
                </ContainerScrollbar>
                <Divider variant="middle" />

            </div>
            <div className={classes.panelContainer}>
                {selectedBuilding &&
                    <PanelSelector building_id={selectedBuilding} />}

            </div>
            <PurpleButton variant="outlined" color="primary" component={Link} to="/dashboard" style={{ marginRight: 20, alignSelf: "flex-end" }} >
                Launch Grid
            </PurpleButton>

        </div>
    );


}

