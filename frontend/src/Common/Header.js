import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button,
    IconButton,
    Drawer,
    Link,
    MenuItem,
} from "@material-ui/core";
import 'fontsource-roboto';
import MenuIcon from "@material-ui/icons/Menu";
import React, { useState, useEffect } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getBuildings } from '../redux/selectors';



const headersData = [
    {
        label: "DESIGN GRID",
        href: "/",

    },
    {
        label: "BUILDINGS CONSUMPTION",
        href: "/consumption",
    },
    {
        label: "BUILDINGS PANELS",
        href: "/panels"

    }
];

const useStyles = makeStyles(() => ({
    header: {
        backgroundColor: "#5f468a",
        paddingLeft: "20px",
        "@media (max-width: 900px)": {
            paddingLeft: 0,
        },
    },
    logo: {
        color: "#FFFEFE",
        textAlign: "left",
        marginRight: "25px"
    },
    menuButton: {
        fontFamily: "Open Sans, sans-serif",
        size: "18px",
        marginLeft: "10px",
    },
    toolbar: {
        display: "flex",
    },
    drawerContainer: {
        padding: "20px 30px",
    },
}));

export default function Header({ title }) {
    const { header, logo, menuButton, toolbar, drawerContainer } = useStyles();
    const history = useHistory();
    const buildingList = useSelector(getBuildings);


    const [state, setState] = useState({
        mobileView: false,
        drawerOpen: false,
    });

    const { mobileView, drawerOpen } = state;

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth < 900
                ? setState((prevState) => ({ ...prevState, mobileView: true }))
                : setState((prevState) => ({ ...prevState, mobileView: false }));
        };

        setResponsiveness();

        window.addEventListener("resize", () => setResponsiveness());
    }, []);

    const displayDesktop = () => {
        return (
            <Toolbar className={toolbar}>
                {pageLogo}
                <div>{getMenuButtons()}</div>
            </Toolbar>
        );
    };

    const displayMobile = () => {
        const handleDrawerOpen = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: true }));
        const handleDrawerClose = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: false }));

        return (
            <Toolbar>
                <IconButton
                    {...{
                        edge: "start",
                        color: "inherit",
                        "aria-label": "menu",
                        "aria-haspopup": "true",
                        onClick: handleDrawerOpen,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <Drawer
                    {...{
                        anchor: "left",
                        open: drawerOpen,
                        onClose: handleDrawerClose,
                    }}
                >
                    <div className={drawerContainer}>{getDrawerChoices()}</div>
                </Drawer>

                <div>{pageLogo}</div>
            </Toolbar>
        );
    };

    const getDrawerChoices = () => {
        return headersData.map(({ label, href }) => {
            return (
                <Link
                    {...{
                        component: RouterLink,
                        to: href,
                        color: "inherit",
                        style: { textDecoration: "none" },
                        key: label,
                    }}
                >
                    <MenuItem>{label}</MenuItem>
                </Link>
            );
        });
    };

    const pageLogo = (
        <Typography variant="h6" component="h1" className={logo}>
            {title.toUpperCase()}
        </Typography>
    );

    const buttonClickHandler = (href) => {
        if ((href === "/consumption" || href === "/panels") && Object.keys(buildingList).length <= 0) {
            alert("A grid must have at least one building");
        } else {
            history.push(href);
        }

    }

    const getMenuButtons = () => {
        return headersData.map(({ label, href }) => {
            return (
                <Button
                    {...{
                        key: label,
                        color: "inherit",
                        onClick: () => buttonClickHandler(href),
                        className: menuButton,
                    }}
                >
                    {label}
                </Button >
            );
        });
    };

    return (
        <header>
            <AppBar className={header}>
                {mobileView ? displayMobile() : displayDesktop()}
            </AppBar>
            <Toolbar />
        </header>
    );
}