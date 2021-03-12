import React, { useEffect, useContext } from "react";
import house from "../assets/house.svg"
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

function BuildingCard({ latitude, longitude, area }) {

    const [buildingType, setBuildingType] = React.useState('Producer');
    const classes = useStyles();

    const handleBuildingType = (event, newAlignment) => {
        if (newAlignment != null) {
            setBuildingType(newAlignment);
        }
    };

    return (
        <Card variant="outlined" style={{ display: "flex", marginTop: 5 }}>
            <div style={{ flex: 1 }}>
                <CardHeader title="Edificio" avatar={<Avatar variant="square" className={classes.sizeBuilding} src={house} />}> </CardHeader>

                <CardContent>
                    <ToggleButtonGroup
                        exclusive
                        value={buildingType}
                        onChange={handleBuildingType}
                        aria-label="building type"
                    >
                        <ToggleButton value="Producer" aria-label="left aligned" variant="text" />
                        <ToggleButton value="Consumer" aria-label="centered" />
                        <ToggleButton value="Both" aria-label="right aligned" />
                    </ToggleButtonGroup>
                </CardContent >

            </div >


            <div style={{ display: "flex", "flexDirection": "column", flex: 3, justifyContent: 'space-evenly' }}>
                <div style={{ display: "flex", "flexDirection": "row", margin: "5px" }}>
                    <Avatar className={classes.sizeAvatar} variant="square" src={locationImg} />
                    <Typography> {latitude} {longitude} </Typography>
                </div>
                <div style={{ display: "flex", "flexDirection": "row", margin: "5px" }}>
                    <Avatar className={classes.sizeAvatar} variant="square" src={areaImg} />
                    <Typography> {area} </Typography>
                </div>
            </div>


        </Card >);
}

export default BuildingCard