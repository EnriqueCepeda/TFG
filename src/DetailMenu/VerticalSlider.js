import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import { Input, Typography } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        width: "3vw"
    },
    slider: {
        height: "19vh",
        marginTop: 12.5,
    },
    input: {
        marginTop: 5,
        marginLeft: 4
    }

}));

const CustomSlider = withStyles({
    root: {
        color: "#5F468A",
        height: 8,

    },
    thumb: {
        height: 20,
        width: "20px !important",
        backgroundColor: "#fff",
        border: "4px solid currentColor",
        "&:focus,&:hover,&:active": {
            boxShadow: "inherit"
        }
    },
    track: {
        height: 20,
        width: "10px !important",
        borderRadius: 24
    },
    rail: {
        width: "10px !important",
        borderRadius: 240,
        opacity: 1,
        color: "#c257be"
    }
})(Slider);

export default function VerticalSlider({ hour }) {
    const classes = useStyles();
    const [value, setValue] = React.useState(hour * 1.5);

    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleInputChange = (event) => {
        setValue(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleBlur = () => {
        if (value < 0) {
            setValue(0);
        } else if (value > 100) {
            setValue(100);
        }
    };

    return (

        <div className={classes.root}>
            <Typography> {hour}h </Typography>
            <div className={classes.slider} >
                <CustomSlider
                    orientation="vertical"
                    aria-label="pretto slider"
                    defaultValue={20}
                    value={typeof value === 'number' ? value : 0}
                    onChange={handleSliderChange}
                />
            </div>
            <div className={classes.input} >
                <Input
                    className={classes.input}
                    value={value}
                    margin="dense"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    inputProps={{
                        step: 10,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                />

            </div>
        </div >
    );
}
