
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
 "Building 558237033": { "latitude": 38.986662400073186, "longitude": -3.9283229282217125, "altitude": 633.9691162109375, "address": "C. de Calatrava, 1, 13001 Ciudad Real, Cdad. Real, Spain", "area": "229.08", "type": "Consumer", "coordinates": [[38.98676419999998, -3.9284], [38.98657709999998, -3.9284177], [38.98656059999999, -3.9283576], [38.98669269999996, -3.9282001000000006], [38.9867337, -3.9283116999999996], [38.98670920000001, -3.9283116], [38.98671189999999, -3.9283451999999994], [38.98674419999995, -3.9283404], [38.98676419999998, -3.9284]], "flatCoordinates": [[-437307.48763229593, 4719775.835090333], [-437309.45798728295, 4719749.039667952], [-437302.7676858863, 4719746.676633031], [-437285.2348660864, 4719765.595249256], [-437297.65812125884, 4719771.467044975], [-437297.6469893098, 4719767.958288589], [-437301.3873242004, 4719768.344967804], [-437300.8529906447, 4719772.970798078], [-437307.48763229593, 4719775.835090333]], "consumption": [1.4, 1, 0.9, 0.9, 1.1, 1.2, 1, 1.2, 2, 2.1, 2.5, 1.9, 1.3, 1.3, 2.6, 1.7, 1.1, 1.2, 1.3, 2.7, 1.8, 2.8, 2, 1.6], "transactions": { }, "maxPanels": 263, "panels": 1 }, "Building 558237031": { "latitude": 38.986793100071196, "longitude": -3.928274662163741, "altitude": 634.0931396484375, "address": "Rda. de Calatrava, 3, 13071 Ciudad Real, Cdad. Real, Spain", "area": "323.82", "type": "Producer", "coordinates": [[38.986761900000005, -3.9281010999999997], [38.98669269999996, -3.9282001000000006], [38.9867337, -3.9283116999999996], [38.98674419999995, -3.9283404], [38.98676419999998, -3.9284], [38.98689350000001, -3.9283877], [38.986892100000034, -3.9283169], [38.98687290000001, -3.9283169], [38.986860500000006, -3.9283009], [38.98687030000002, -3.9282782], [38.986761900000005, -3.9281010999999997]], "flatCoordinates": [[-437274.2142364978, 4719775.505696683], [-437285.2348660864, 4719765.595249256], [-437297.65812125884, 4719771.467044975], [-437300.8529906447, 4719772.970798078], [-437307.48763229593, 4719775.835090333], [-437306.11840255914, 4719794.352759262], [-437298.236982611, 4719794.152258413], [-437298.236982611, 4719791.402532864], [-437296.45587075833, 4719789.626668848], [-437293.9289183173, 4719791.030174255], [-437274.2142364978, 4719775.505696683]], "consumption": [4.5, 3.7, 2.9, 2.5, 2.3, 2.1, 2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.5, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.3, 2.6, 3.2, 3.7], "transactions": { }, "maxPanels": 400, "panels": 40 }, "Building 558237032": { "latitude": 38.98698410006017, "longitude": -3.9283254009183546, "altitude": 633.9298095703125, "address": "C. de Toledo, 6, 13001 Ciudad Real, Cdad. Real, Spain", "area": "196.30", "type": "Prosumer", "coordinates": [[38.98689350000001, -3.9283877], [38.98707640000001, -3.9283770000000002], [38.98706709999999, -3.9282613000000004], [38.986891799999995, -3.9282763000000003], [38.986892100000034, -3.9283169], [38.98689350000001, -3.9283877]], "flatCoordinates": [[-437306.11840255914, 4719794.352759262], [-437304.92728400766, 4719820.546797278], [-437292.0476189229, 4719819.214895405], [-437293.7174112848, 4719794.109293942], [-437298.236982611, 4719794.152258413], [-437306.11840255914, 4719794.352759262]], "consumption": [0.9, 0.7, 0.7, 0.9, 0.6, 0.8, 1.7, 1, 1.3, 1.1, 1.6, 1, 1.5, 1.4, 1.5, 1.3, 1.6, 1.8, 1.4, 1.4, 2.3, 2.6, 1.8, 1.3], "transactions": { }, "maxPanels": 224, "panels": 20 } 
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