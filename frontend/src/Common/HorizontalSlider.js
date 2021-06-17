import { Slider, styled } from "@material-ui/core";

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
        left: 'calc(-50% + 6px)',
    }
});

export default HorizontalSlider;