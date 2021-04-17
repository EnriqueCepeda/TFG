import React from "react";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core/';
import BuildingCard from './BuildingCard';
import { useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import { Divider } from '@material-ui/core';
import { Box } from '@material-ui/core';
import {
    Link
} from "react-router-dom";
import { getBuildings } from '../redux/selectors';
import { purple } from '@material-ui/core/colors';
import { ContainerScrollbar } from '../Common'




const useStyles = makeStyles(() => ({
    buildingContainer: {
        flex: 2,
        display: 'flex',
        flexDirection: "column",
    },
    buildingList: {
        flex: 12
    },
    buildingDetailButton: {
        flex: 1,
        marginTop: 20,
    }
}));

const ColorButton = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText('rgb(95,70,138)'),
        backgroundColor: 'rgb(95, 70, 138)',
        '&:hover': {
            backgroundColor: purple[900],
        },
    },
}))(Button);

function BuildingContainer({ centerSetter, zoomSetter }) {

    const classes = useStyles();
    const buildingList = useSelector(getBuildings);

    return (
        <div className={classes.buildingContainer}>
            <Typography variant="h5" align="center" style={{ marginBottom: 10 }}> SELECTED BUILDINGS </Typography>
            <Divider variant="middle" />
            <ContainerScrollbar autoHide autoHideTimeout={500} autoHideDuration={200} className={classes.buildingList}>
                {
                    Object.keys(buildingList).map((dictkey, index) => (
                        <React.Fragment key={dictkey}>
                            <BuildingCard ol_uid={dictkey} centerSetter={centerSetter} />
                        </React.Fragment>
                    ))
                }
            </ContainerScrollbar>
            <Divider variant="middle" />
            <div className={classes.buildingDetailButton}>
                <Box textAlign='center'>
                    <ColorButton color="primary" component={Link} to="/detail" >
                        grid detail
                </ColorButton>
                </ Box>
            </div>

        </div >

    )

}

export default BuildingContainer