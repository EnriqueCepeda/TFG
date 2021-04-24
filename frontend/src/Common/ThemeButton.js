
import { withStyles } from '@material-ui/core/styles';
import { purple } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';


const ThemeButton = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText('rgb(95,70,138)'),
        backgroundColor: 'rgb(95, 70, 138)',
        '&:hover': {
            backgroundColor: purple[900],
        },
    },
}))(Button);

export default ThemeButton;