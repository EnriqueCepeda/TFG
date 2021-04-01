import React, { useContext, useMemo } from "react";
import { Box, Button, CardContent, Typography } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import VerticalSlider from "./VerticalSlider";
import { Card } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux'
import { CardHeader } from '@material-ui/core';
import { Avatar, CardActionArea } from '@material-ui/core';
import locationImg from "../assets/location.svg"
import areaImg from "../assets/area.svg"
import consumer from "../assets/house.svg"
import both from "../assets/solar-house.svg"
import { green, purple } from '@material-ui/core/colors';
import { getBuilding, getBuildingConsumption } from "../redux/selectors"



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
    detailCard: {
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        marginBottom: '10px',
        display: "inline-block"

    },
    cardHeader: {
        flexGrow: 1
    },
    cardContent: {
        display: "flex"
    },
    cardContentRow: {
        display: "flex",
        margin: "5px",
        marginBottom: "15px"
    },
    typographyStyle: {
        flexGrow: 1
    },
    header: {
        display: "flex"
    }

}));

/*
const ColorButton = withStyles((theme) => ({
    root: {
        justifyContent: 'center',
        color: theme.palette.getContrastText(purple[500]),
        backgroundColor: '#7658a9',
        '&:hover': {
            backgroundColor: '#5F468A',
        },
    },
}))(Button);
*/

function DetailCard({ ol_uid }) {

    const building = useSelector(state => getBuilding(state, ol_uid));
    const buildingConsumption = useSelector((state) => getBuildingConsumption(state, ol_uid));
    const classes = useStyles();

    function getHourSliders() {
        let sliders = [];
        for (let i = 0; i <= 24; i++) {
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
            case "Consumer & Producer":
                return <Avatar variant="square" className={classes.sizeBuilding} src={both} />
            default:
                return <Avatar variant="square" className={classes.sizeBuilding} src={consumer} />
        }
    };

    return (
        <Card variant="outlined" className={classes.detailCard}>
            <div className={classes.cardContent}>
                <Card>
                    {renderBuildingAvatar(building.type)}
                    <CardContent>
                        <div className={classes.cardContentRow}>
                            <Typography className={classes.typographyStyle} align="center"> {building.type}</Typography>
                        </div>
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
                <CardContent style={{ display: "flex", height: "25vh", }}>
                    {getHourSliders()
                    }
                </CardContent>
            </div>


        </Card >);


}

export default DetailCard