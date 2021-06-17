import React from "react";
import consumer from "../assets/house.svg";
import producer from "../assets/panel-solar.svg";
import both from "../assets/solar-house.svg";
import locationImg from "../assets/location.svg";
import areaImg from "../assets/area.svg";
import { Avatar, CardActionArea } from '@material-ui/core';
import { Card } from '@material-ui/core';
import { CardContent } from '@material-ui/core';
import { CardHeader } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { ToggleButtonGroup } from '@material-ui/lab';
import { ToggleButton } from '@material-ui/lab';
import { useSelector, useDispatch } from 'react-redux';
import { updateBuildingType } from '../redux/actions/buildingActions.js';
import { getBuilding } from '../redux/selectors';
import { GreyTypography, PurpleTypography } from "../Common";


const useStyles = makeStyles(() => ({
    sizeBuilding: {
        height: 50,
        width: 50,
    },
    sizeAvatar: {
        height: 30,
        width: 30,
        marginRight: 5,
    },
    card: {
        display: "flex",
        marginLeft: 20,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10
    },
    leftContent: {
        flex: 1
    },

    rightContent: {
        display: "flex",
        flexDirection: "column",
        flex: 3,
        justifyContent: 'space-evenly'
    },

    cardContentRow: {
        display: "flex",
        flexDirection: "row",
        margin: "5px"
    }
}));

function BuildingCard({ ol_uid, centerSetter }) {


    const classes = useStyles();
    const building = useSelector(state => getBuilding(state, ol_uid));
    const dispatch = useDispatch();

    const renderBuildingAvatar = (building_type) => {
        switch (building_type) {
            case "Consumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
            case "Producer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={producer} />
            case "Prosumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
            default:
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
        }
    };

    const handleBuildingType = (event, value) => {
        if (value != null) {
            dispatch(updateBuildingType(ol_uid, value));
        }
    };

    function clickCardHandler() {
        centerSetter([building.longitude, building.latitude])
    }

    return (
        <Card variant="outlined" className={classes.card}>
            <div className={classes.leftContent}>
                <CardHeader avatar={renderBuildingAvatar(building.type)}> </CardHeader>
                <CardContent>
                    <ToggleButtonGroup
                        exclusive
                        value={building.type}
                        onChange={handleBuildingType}
                        aria-label="building type"
                    >
                        <ToggleButton value="Consumer" aria-label="Consumer" title="Consumer"> {""} </ToggleButton>
                        <ToggleButton value="Producer" aria-label="Producer" title="Producer"> {""} </ToggleButton>
                        <ToggleButton value="Prosumer" aria-label="Prosumer" title="Prosumer"> {""} </ToggleButton>
                    </ToggleButtonGroup>
                </CardContent >
            </div >

            <CardActionArea onClick={clickCardHandler}>
                <CardContent className={classes.rightContent}>
                    <div className={classes.cardContentRow}>
                        <Avatar className={classes.sizeAvatar} variant="square" src={locationImg} />
                        <Typography> {building.address} </Typography>
                    </div>
                    <div className={classes.cardContentRow}>
                        <Avatar className={classes.sizeAvatar} variant="square" src={areaImg} />
                        <Typography variant="subtitle1"> {building.area} m² </Typography>
                    </div>
                    <div className={classes.cardContentRow}>
                        <Typography> {building.type} - <GreyTypography display="inline"> {ol_uid} </GreyTypography> </Typography>
                    </div>
                </CardContent>
            </CardActionArea>

        </Card >);
}

export default BuildingCard