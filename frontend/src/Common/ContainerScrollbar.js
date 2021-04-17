import { Scrollbars } from 'react-custom-scrollbars';
import React from "react";

const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
        borderRadius: 6,
        backgroundColor: "#5F468A"
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

const ContainerScrollbar = (props) => (
    <Scrollbars
        renderThumbHorizontal={renderThumb}
        renderThumbVertical={renderThumb}
        {...props}
    />
);

export default ContainerScrollbar;
