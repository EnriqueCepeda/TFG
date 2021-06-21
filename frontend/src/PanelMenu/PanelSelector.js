import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, makeStyles, Icon, Grid, Typography } from "@material-ui/core";
import { PurpleButton } from "../Common"
import SolarPanel from "../assets/panel-solar2.svg"
import { useDispatch, useSelector } from "react-redux";
import { getBuilding } from "../redux/selectors";
import { updateBuildingPanels } from "../redux/actions/buildingActions";
import { HorizontalSlider } from "../Common";

const useStyles = makeStyles((theme) => ({
    card: {
        width: 400,
    },
    buttons: {
        display: "flex",
        justifyContent: "space-evenly"
    },
    slider: {
        display: "flex",
        flexDirection: "row",
        marginRight: 5,
        marginLeft: 5
    },
    typographyStyle: {
        textAlign: "center"
    }
}));

function PanelIcon() {
    return (
        <Icon >
            <img src={SolarPanel} height={33} width={33} alt="panels" />
        </Icon>
    );
}


export function PanelSelector({ building_id }) {

    const classes = useStyles();
    const building = useSelector(state => getBuilding(state, building_id));
    const [panels, setPanels] = useState(building.panels);
    const [maxPanels, setMaxPanels] = useState(building.maxPanels);
    const dispatch = useDispatch();

    function CardSubHeader() {
        return (<Typography>
            {building.type + " - " + building_id}
        </Typography>);
    }

    const handleSliderChange = (event, panels) => {
        setPanels(panels);
    };

    const handleSliderCommit = (event, panels) => {
        setPanels(panels);
        dispatch(updateBuildingPanels(building_id, panels))
    }

    const buttonPercentagePanelsCommit = (percentage) => {
        let finalPanels = Math.floor(maxPanels * (percentage / 100));
        setPanels(finalPanels);
        dispatch(updateBuildingPanels(building_id, finalPanels))

    }

    useEffect(() => {
        setMaxPanels(building.maxPanels);
        setPanels(building.panels);
    }, [building_id])

    return (
        <Card variant="outlined" className={classes.card}>
            <CardHeader title="Photovoltaic panels quantity" style={{ textAlign: "center" }} subheader={<CardSubHeader />} />

            <CardContent>
                <Grid container spacing={3}>
                    <Grid container item spacing={3}>
                        <Grid item>
                            <PanelIcon />
                        </Grid>
                        <Grid item xs >
                            <HorizontalSlider
                                valueLabelDisplay="auto"
                                orientation="horizontal"
                                defaultValue={0}
                                min={0}
                                step={1}
                                max={maxPanels}
                                style={{ marginTop: 4 }}
                                value={typeof panels === 'number' ? panels : 0}
                                onChange={handleSliderChange}
                                onChangeCommitted={handleSliderCommit}
                            />
                        </Grid>
                    </Grid>
                    <Grid container item spacing={1} justify="center">
                        <Grid item>
                            <PurpleButton variant="outlined" onClick={() => buttonPercentagePanelsCommit(10)}> 10% </PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton variant="outlined" onClick={() => buttonPercentagePanelsCommit(25)}>25%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton variant="outlined" onClick={() => buttonPercentagePanelsCommit(50)}>50%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton variant="outlined" onClick={() => buttonPercentagePanelsCommit(75)}>75%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton variant="outlined" onClick={() => buttonPercentagePanelsCommit(100)}>100%</PurpleButton>
                        </Grid>
                    </Grid>
                </Grid>


            </CardContent >
        </Card >
    )

}