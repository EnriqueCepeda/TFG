import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardActions, makeStyles, Slider, styled, Icon, Grid } from "@material-ui/core";
import { PurpleButton } from "../Common"
import SolarPanel from "../assets/solar-panel-simple.svg"
import { Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getBuilding } from "../redux/selectors";
import { updateBuildingPanels } from "../redux/actions/buildingActions";

const useStyles = makeStyles((theme) => ({
    card: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20,
        marginBottom: 20,
        width: 400
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

const HorizontalSlider = styled(Slider)({
    color: '#5F468A',
    height: 8,
    '& .MuiSlider-thumb': {
        height: 23,
        width: 23,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -5,
        marginLeft: -12,
        '&:focus, &:hover, &.Mui-active': {
            boxShadow: 'inherit',
        },
    },
    '& .MuiSlider-track': {
        height: 12.5,
        borderRadius: "24px 24px 24px 24px",
        marginBottom: "-2px"
    },
    '& .MuiSlider-rail': {
        height: 10,
        borderRadius: 24,
        opacity: 1,
        color: "rgba(255, 242, 175)",
        border: "1px solid rgba(246, 207, 101)",
    },
    '& .MuiSlider-valueLabel': {
        left: 'calc(-50% + 2px)',
    }
});

function PanelIcon() {
    return (
        <Icon >
            <img src={SolarPanel} height={33} width={33} />
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
                        <Grid item xs>
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
                            <PurpleButton onClick={() => buttonPercentagePanelsCommit(10)}> 10% </PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton onClick={() => buttonPercentagePanelsCommit(25)}>25%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton onClick={() => buttonPercentagePanelsCommit(50)}>50%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton onClick={() => buttonPercentagePanelsCommit(75)}>75%</PurpleButton>
                        </Grid>
                        <Grid item>
                            <PurpleButton onClick={() => buttonPercentagePanelsCommit(100)}>100%</PurpleButton>
                        </Grid>
                    </Grid>
                </Grid>


            </CardContent >
        </Card >
    )

}