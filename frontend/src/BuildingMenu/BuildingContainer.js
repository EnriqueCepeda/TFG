import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core/';
import BuildingCard from './BuildingCard';
import { useSelector } from 'react-redux';
import { Divider } from '@material-ui/core';
import { Box } from '@material-ui/core';
import {
    Link, useHistory
} from "react-router-dom";
import { getBuildings } from '../redux/selectors';
import { ContainerScrollbar, PurpleButton } from '../Common'




const useStyles = makeStyles(() => ({
    buildingContainer: {
        flex: 2,
        display: 'flex',
        flexDirection: "column",
    },
    buildingList: {
        flex: 12,
    },
    buildingConsumptionButton: {
        flex: 1,
        marginTop: 20,
    }
}));


function BuildingContainer({ centerSetter, zoomSetter }) {

    const classes = useStyles();
    const buildingList = useSelector(getBuildings);
    const history = useHistory();

    function designSubmitListener(buildingList) {
        if (Object.keys(buildingList).length <= 0) {
            alert("A grid must have at least one building");
        } else {
            history.push("/consumption")
        }
    }

    return (
        <div className={classes.buildingContainer}>
            <Typography variant="h5" align="center" style={{ marginBottom: 10 }}>SELECTED BUILDINGS</Typography>
            <Divider variant="middle" />
            <ContainerScrollbar className={classes.buildingList}>
                {
                    Object.keys(buildingList).map((dictkey, index) => (
                        <React.Fragment key={dictkey}>
                            <BuildingCard ol_uid={dictkey} centerSetter={centerSetter} />
                        </React.Fragment>
                    ))
                }
            </ContainerScrollbar>
            <Divider variant="middle" />
            <div className={classes.buildingConsumptionButton}>
                <Box textAlign='center'>
                    <PurpleButton color="primary" onClick={() => designSubmitListener(buildingList)} >
                        buildings consumption
                    </PurpleButton>
                </ Box>
            </div>

        </div >

    )

}

export default BuildingContainer