import React, { useContext, useMemo } from "react";
import { Box, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VerticalSlider from "./VerticalSlider";
import { Card } from '@material-ui/core';
import { useSelector } from 'react-redux'
import { CardHeader } from '@material-ui/core';
import { Avatar, CardActionArea } from '@material-ui/core';
import locationImg from "../assets/location.svg"
import areaImg from "../assets/area.svg"
import consumer from "../assets/house.svg"
import both from "../assets/solar-house.svg"






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
    detailCard: {
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        marginBottom: '10px',
        display: "inline-block"

    },
    cardContent: {
        display: "flex"
    },
    cardContentRow: {
        display: "flex",
        margin: "5px",
        marginBottom: "15px"
    },
    header: {
        display: "flex"
    }

}));

function DetailCard({ ol_uid }) {

    const building = useSelector(state => state.buildings[ol_uid]);


    function getHourSliders() {
        let sliders = [];
        for (let i = 0; i <= 24; i++) {

            sliders.push(<React.Fragment key={i}> <VerticalSlider hour={i} /> </React.Fragment >)
        }
        return sliders

    }


    const renderBuildingAvatar = (building_type) => {
        switch (building_type) {
            case "Consumer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
            case "Consumer & Producer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
            default:
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
        }
    };

    const classes = useStyles();

    return (
        <Card variant="outlined" className={classes.detailCard}>
            <div className={classes.cardContent}>
                <Card className={classes.card}>
                    <CardHeader title={building.type} avatar={renderBuildingAvatar(building.type)}> </CardHeader>

                    <CardContent>
                        <div className={classes.cardContentRow}>
                            <Avatar className={classes.sizeAvatar} variant="square" src={locationImg} />
                            <Typography> Lat {building.latitude.toFixed(4)}, Lon {building.longitude.toFixed(4)} </Typography>
                        </div>
                        <div className={classes.cardContentRow}>
                            <Avatar className={classes.sizeAvatar} variant="square" src={areaImg} />
                            <Typography> {building.area} m² </Typography>
                        </div>
                    </CardContent>
                </Card >
                <CardContent style={{ display: "flex" }}>
                    {getHourSliders()
                    }
                </CardContent>
            </div>


        </Card >);
}

export default DetailCard