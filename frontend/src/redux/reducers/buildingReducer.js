
import {
    ADD_BUILDING, REMOVE_BUILDING, UPDATE_BUILDING_TYPE, UPDATE_BUILDING_CONSUMPTION,
    ADD_TRANSACTION, UPDATE_BUILDING_ADDRESS, UPDATE_BUILDING_MAX_PANELS,
    UPDATE_BUILDING_PANELS, UPDATE_BUILDING_ALTITUDE, REMOVE_GRID_DATA
} from '../actions/types';
import _ from "lodash";


let realInitialState = {
    "grid agent": {
        "transactions": {},
    },
}

function convertUTCDateToLocalDate(datestr) {
    var date = new Date(datestr);
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toLocaleDateString(undefined,
        {
            weekday: 'short', // long, short, narrow
            day: 'numeric', // numeric, 2-digit
            year: 'numeric', // numeric, 2-digit
            month: 'long', // numeric, 2-digit, long, short, narrow
            hour: 'numeric', // numeric, 2-digit
        });
}

let testInitialState = {

}


let initialState = Object.assign({}, realInitialState, testInitialState);

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_BUILDING_TYPE: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].type = action.building_type;
            return stateCloned;
        }
        case UPDATE_BUILDING_ADDRESS: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].address = action.building_address;
            return stateCloned;
        }
        case UPDATE_BUILDING_ALTITUDE: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].altitude = action.building_altitude;
            return stateCloned;
        }
        case UPDATE_BUILDING_CONSUMPTION: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].consumption[action.hour] = action.value;
            return stateCloned;
        }
        case ADD_BUILDING: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id] = action.building_data;
            return stateCloned;
        }
        case REMOVE_BUILDING: {
            let stateCloned = _.cloneDeep(state);
            delete stateCloned[action.building_id];
            return stateCloned;
        }
        case ADD_TRANSACTION: {
            let stateCloned = _.cloneDeep(state);

            var timestamp = convertUTCDateToLocalDate(action.grid_timestamp);
            if (timestamp in stateCloned[action.receiver].transactions) {
                stateCloned[action.receiver].transactions[timestamp].push([action.sender, +action.energy]);
            } else {
                stateCloned[action.receiver].transactions[timestamp] = [[action.sender, +action.energy]];
            }

            if (timestamp in stateCloned[action.sender].transactions) {
                stateCloned[action.sender].transactions[timestamp].push([action.receiver, -action.energy]);
            } else {
                stateCloned[action.sender].transactions[timestamp] = [[action.receiver, -action.energy]];
            }
            return stateCloned;
        }
        case UPDATE_BUILDING_MAX_PANELS: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].maxPanels = action.maxPanels
            return stateCloned
        }
        case UPDATE_BUILDING_PANELS: {
            let stateCloned = _.cloneDeep(state);
            stateCloned[action.building_id].panels = action.panels
            return stateCloned
        }
        case REMOVE_GRID_DATA: {
            let stateCloned = _.cloneDeep(state);
            Object.keys(stateCloned).forEach((buildingId) => {
                stateCloned[buildingId].transactions = {}
            })
            return stateCloned;
        }
        default:
            return state;
    }

};


export default reducer;