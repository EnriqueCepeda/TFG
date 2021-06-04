import React from "react";
import { CardContent, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VerticalSlider from "./VerticalSlider";
import { Card } from '@material-ui/core';
import { useSelector } from 'react-redux'
import { Avatar } from '@material-ui/core';
import locationImg from "../assets/location.svg"
import areaImg from "../assets/area.svg"
import consumer from "../assets/house.svg"
import both from "../assets/solar-house.svg"
import { getBuilding, getBuildingConsumption } from "../redux/selectors"
import _ from "lodash";

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
    consumptionCard: {
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        marginBottom: '10px',
        display: "inline-block",

    },
    cardHeader: {
        flexGrow: 1,
    },
    cardContent: {
        display: "flex",
        marginRight: 10,
    },
    cardContentRow: {
        display: "flex",
        margin: "5px",
        marginBottom: "15px",
    },
    typographyStyle: {
        flexGrow: 1,
    },
    sliders: {
        display: "flex",
        height: "25vh",
        margin: "15px 0px 15px 25px",

    },
    graph: {
        alignItems: "center",
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        width: 160,
        display: "flex",
        flexDirection: "column"
    },

}));

export default function ConsumptionCard({ ol_uid }) {

    const building = useSelector(state => getBuilding(state, ol_uid));
    const buildingConsumption = useSelector((state) => getBuildingConsumption(state, ol_uid));
    const classes = useStyles();

    function getHourSliders() {
        let sliders = [];
        for (let i = 0; i <= 23; i++) {
            var marginTitle = 3;
            if (i <= 9) {
                marginTitle = 8;
            }
            sliders.push(<React.Fragment key={i}> <VerticalSlider ol_uid={ol_uid} hour={i} marginTitle={marginTitle} initialValue={buildingConsumption[i]} /> </React.Fragment >)
        }
        return sliders
    }


    const renderBuildingAvatar = (building_type) => {
        switch (building_type) {
            case "Consumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
            case "Prosumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
            default:
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
        }
    };

    return (
        <Card variant="outlined" className={classes.consumptionCard}>
            <div className={classes.cardContent}>
                <Card >
                    {renderBuildingAvatar(building.type)}
                    <CardContent>
                        <div className={classes.cardContentRow}>
                            <Typography className={classes.typographyStyle} align="center"> {building.type}</Typography>
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
                </Card >
                <div className={classes.sliders}>
                    {getHourSliders()
                    }
                </div>
                <Divider orientation="vertical" flexItem variant="middle" />
                <div className={classes.graph}>
                    <Typography variant="h6" align="center" > ENERGY CONSUMPTION </ Typography >
                    <Divider variant="middle" />

                    <Typography variant="h3" align="center"> {_.sum(buildingConsumption).toFixed(2)} </ Typography >
                    <Typography variant="h3" align="center"> Kw </Typography >
                </div>
            </div>
        </Card >);
}