import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import { Input, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux'
import { updateBuildingConsumption } from '../redux/actions/buildingActions.js'
import ValueLabel from "@material-ui/core/Slider/ValueLabel";



const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        width: "3vw"
    },
    slider: {
        height: "19vh",
        marginTop: 20,
    },
    input: {
        marginTop: 5,
        marginLeft: 4
    }

}));

const CustomSlider = withStyles({
    root: {
        color: "#5F468A",
    },
    thumb: {
        width: "23px !important",
        height: "23px !important",
        backgroundColor: "#fff",
        border: "2px solid currentColor",
        "&:focus, &:hover,&:active": {
            boxShadow: "none !important",
        }
    },
    track: {
        width: "12.5px !important",
        borderRadius: "0 0 24px 24px",
        marginBottom: "-2px",
    },
    rail: {
        width: "10px !important",
        borderRadius: 24,
        opacity: 1,
        color: "rgba(255, 242, 175)",
        border: "1px solid rgba(246, 207, 101)",

    },
    valueLabel: {
        left: 'calc(-50% + 2px)',
    }

})(Slider);

export default function VerticalSlider({ ol_uid, hour, marginTitle, initialValue }) {
    const classes = useStyles();
    const [value, setValue] = React.useState(initialValue);
    const dispatch = useDispatch();

    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSliderCommit = (event, newValue) => {
        setValue(newValue);
        dispatch(updateBuildingConsumption(ol_uid, hour, newValue));
    }

    const getLabelFormatted = (value) => `${value}Kw`

    return (
        <div className={classes.root}>
            <Typography style={{ marginLeft: marginTitle }}> {hour}h </Typography>
            <div className={classes.slider} >
                <CustomSlider
                    orientation="vertical"
                    valueLabelDisplay='auto'
                    defaultValue={0}
                    min={0}
                    step={0.1}
                    max={10}
                    value={typeof value === 'number' ? value : 0}
                    onChange={handleSliderChange}
                    onChangeCommitted={handleSliderCommit}
                    aria-label="consumption slider"
                    getAriaValueText={(value, index) => getLabelFormatted(value)}

                    valueLabelFormat={(value) => getLabelFormatted(value)}


                />
            </div>
        </div >
    );
}