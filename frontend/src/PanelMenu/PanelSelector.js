import React from "react";
import { Card, CardHeader, CardContent, CardActions, makeStyles, Slider, styled } from "@material-ui/core";
import { PurpleButton } from "../Common"
import { VerticalSlider } from "../Common";

const useStyles = makeStyles((theme) => ({
    card: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20,
        marginBottom: 20
    },
    buttons: {
        display: "flex",
        justifyContent: "space-evenly"
    },
    slider: {
        width: 200,
        height: 200
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


export function PanelSelector({ building_id }) {

    const classes = useStyles();

    return (
        <Card variant="outlined" className={classes.card}>
            <CardHeader title="Photovoltaic panels quantity" style={{ textAlign: "center" }} />
            <CardContent>

                <HorizontalSlider
                    valueLabelDisplay="auto"
                    orientation="horizontal"
                    valueLabelDisplay='auto'
                    defaultValue={0}
                    min={0}
                    step={0.1}
                    max={10}
                />

            </CardContent >
        </Card>
    )

}