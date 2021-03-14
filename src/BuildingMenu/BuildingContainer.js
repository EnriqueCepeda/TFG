import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Box } from "@material-ui/core"
import { Typography } from '@material-ui/core/';
import BuildingCard from './BuildingCard'
import { useSelector, useDispatch } from 'react-redux'


const useStyles = makeStyles(() => ({
    buildingContainer: {
        marginLeft: 5,
        marginRight: 10,
        height: "100%",
        width: "25%",
        flex: 2,
    },
}));

function BuildingContainer() {

    const classes = useStyles();
    const buildingList = useSelector(state => state.buildings);

    return (
        <Box className={classes.buildingContainer} overflow="auto">
            <Typography variant="h5" align="center"> Edificios seleccionados</Typography>
            {Object.keys(buildingList).map((dictkey, index) => (
                <BuildingCard ol_uid={dictkey} />
            ))}
        </Box >
    )

}

export default BuildingContainer