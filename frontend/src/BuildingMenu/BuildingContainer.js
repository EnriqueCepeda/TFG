import React from "react";
import { makeStyles, Divider, Box } from '@material-ui/core/';
import BuildingCard from './BuildingCard';
import { useSelector } from 'react-redux';
import {
    useHistory
} from "react-router-dom";
import { getBuildings } from '../redux/selectors';
import { ContainerScrollbar, PurpleButton, DarkPurpleTypography } from '../Common'




const useStyles = makeStyles(() => ({
    buildingContainer: {
        display: 'flex',
        flexBasis: 425,
        maxWidth: 475,
        minWidth: 425,
        flexDirection: "column",
        marginLeft: 10,
    },
    buildingList: {
        flex: 20,
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
            alert("The grid must have at least one building");
        } else {
            history.push("/consumption")
        }
    }

    return (
        <div className={classes.buildingContainer}>
            <DarkPurpleTypography variant="h5" align="center" style={{ marginBottom: 10 }}>SELECTED BUILDINGS</DarkPurpleTypography>
            <Divider variant="middle" />

            <ContainerScrollbar autoHide className={classes.buildingList}>
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
                    <PurpleButton variant="outlined" color="primary" onClick={() => designSubmitListener(buildingList)} >
                        buildings consumption
                    </PurpleButton>
                </ Box>
            </div>

        </div >

    )

}

export default BuildingContainer