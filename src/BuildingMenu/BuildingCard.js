import React, { useContext } from "react";
import consumer from "../assets/house.svg"
import producer from "../assets/panel-solar.svg"
import both from "../assets/solar-house.svg"
import locationImg from "../assets/location.svg"
import areaImg from "../assets/area.svg"
import { Avatar } from '@material-ui/core';
import { Card } from '@material-ui/core';
import { CardContent } from '@material-ui/core';
import { CardHeader } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { ToggleButtonGroup } from '@material-ui/lab';
import { ToggleButton } from '@material-ui/lab';
import { useSelector, useDispatch } from 'react-redux'
import { updateBuildingType } from '../redux/actions/buildingActions.js'


const useStyles = makeStyles(() => ({
    sizeBuilding: {
        height: 50,
        width: 50,
        marginLeft: 10,
        marginRight: 5
    },
    sizeAvatar: {
        height: 30,
        width: 30,
        marginLeft: 10,
        marginRight: 5
    },
}));

function BuildingCard({ ol_uid }) {


    const classes = useStyles();
    const building = useSelector(state => state.buildings[ol_uid]);
    const dispatch = useDispatch();

    const renderBuildingAvatar = (building_type) => {
        switch (building_type) {
            case "Producer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={producer} />
            case "Consumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
            case "Both":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
        }
    };

    const handleBuildingType = (event, value) => {
        if (value != null) {
            dispatch(updateBuildingType(ol_uid, value));
        }
    };

    return (
        <Card variant="outlined" style={{ display: "flex", marginTop: 5 }}>
            <div style={{ flex: 1 }}>
                <CardHeader title={ol_uid} avatar={renderBuildingAvatar(building.type)}> </CardHeader>
                <CardContent>
                    <ToggleButtonGroup
                        exclusive
                        value={building.type}
                        onChange={handleBuildingType}
                        aria-label="building type"
                    >
                        <ToggleButton value="Consumer" aria-label="left aligned" variant="text" />
                        <ToggleButton value="Producer" aria-label="centered" />
                        <ToggleButton value="Both" aria-label="right aligned" />
                    </ToggleButtonGroup>
                </CardContent >
            </div >


            <div style={{ display: "flex", "flexDirection": "column", flex: 3, justifyContent: 'space-evenly' }}>
                <div style={{ display: "flex", "flexDirection": "row", margin: "5px" }}>
                    <Avatar className={classes.sizeAvatar} variant="square" src={locationImg} />
                    <Typography> {building.latitude} {building.longitude} </Typography>
                </div>
                <div style={{ display: "flex", "flexDirection": "row", margin: "5px" }}>
                    <Avatar className={classes.sizeAvatar} variant="square" src={areaImg} />
                    <Typography> {building.area} </Typography>
                </div>
            </div>
        </Card >);
}

export default BuildingCard