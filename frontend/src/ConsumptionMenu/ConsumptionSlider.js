import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { useDispatch } from 'react-redux';
import { updateBuildingConsumption } from '../redux/actions/buildingActions.js';
import VerticalSlider from "../Common/VerticalSlider.js";



const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        width: "3vw"
    },
    slider: {
        height: 200,
        marginTop: 20,
    },
    input: {
        marginTop: 5,
        marginLeft: 4
    }

}));



export default function ConsumptionSlider({ ol_uid, hour, marginTitle, initialValue }) {
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

    return (
        <div className={classes.root}>
            <Typography style={{ marginLeft: marginTitle }}> {hour}h </Typography>
            <div className={classes.slider} >
                <VerticalSlider
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
                />
            </div>
        </div >
    );
}