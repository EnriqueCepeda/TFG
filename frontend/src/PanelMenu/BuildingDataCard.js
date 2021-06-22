import React from "react"
import { useSelector } from "react-redux"

import { Card, CardContent, CardActionArea, Typography, Avatar, makeStyles } from "@material-ui/core"
import locationImg from "../assets/location.svg"
import areaImg from "../assets/area.svg"
import consumer from "../assets/house.svg"
import both from "../assets/solar-house.svg"
import producer from "../assets/panel-solar.svg"
import { getBuilding } from "../redux/selectors"
import { GreyTypography } from "../Common"

const useStyles = makeStyles(() => ({
    sizeBuilding: {
        height: 50,
        width: 50,
        marginTop: 15,
        marginLeft: "auto",
        marginRight: "auto",
    },
    sizeAvatar: {
        height: 30,
        width: 30,
        marginRight: 5,
    },
    cardContentRow: {
        display: "flex",
        margin: "5px",
        marginBottom: "15px",
    },
    typographyStyle: {
        flexGrow: 1,
    },
}));


export default function BuildingDataCard({ building_id, selectedBuildingSetter }) {

    const classes = useStyles();
    const building = useSelector(state => getBuilding(state, building_id))

    const getBuildingAvatar = (building_type) => {
        switch (building_type) {
            case "Consumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
            case "Prosumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
            default:
                return <Avatar variant="square" className={classes.sizeBuilding} src={producer} />
        }
    };

    function clickCardHandler() {
        selectedBuildingSetter(building_id);
    }

    return (
        <Card variant="outlined" >
            <CardActionArea onClick={clickCardHandler}>
                {getBuildingAvatar(building.type)}
                <CardContent>
                    <div className={classes.cardContentRow}>
                        <Typography display="inline" className={classes.typographyStyle} align="center">
                            {building.type} - <GreyTypography display="inline"> {building_id}</GreyTypography>
                        </Typography>
                    </div>
                    <div className={classes.cardContentRow}>
                        <Avatar className={classes.sizeAvatar} variant="square" src={locationImg} />
                        <Typography> {building.address} </Typography>
                    </div>
                    <div className={classes.cardContentRow}>
                        <Avatar className={classes.sizeAvatar} variant="square" src={areaImg} />
                        <Typography> {building.area} m² </Typography>
                    </div>
                </CardContent>
            </CardActionArea>
        </Card >
    )
}