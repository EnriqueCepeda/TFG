import { withStyles } from "@material-ui/styles";
import { Slider } from "@material-ui/core";

const VerticalSlider = withStyles({
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

export default VerticalSlider