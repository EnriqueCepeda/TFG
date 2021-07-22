
import { ADD_BUILDING, REMOVE_BUILDING, UPDATE_BUILDING_TYPE, UPDATE_BUILDING_CONSUMPTION, ADD_TRANSACTION, UPDATE_BUILDING_ADDRESS, UPDATE_BUILDING_MAX_PANELS, UPDATE_BUILDING_PANELS, UPDATE_BUILDING_ALTITUDE } from '../actions/types';
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
    "Building 556053480": {
        "latitude": 38.985879300067154,
        "longitude": -3.928255572956564,
        "altitude": 634.7803344726562,
        "address": "Calle María Cristina, 2, 13001 Ciudad Real, Cdad. Real, Spain",
        "area": "399.35",
        "type": "Prosumer",
        "coordinates": [
            [
                38.9859768,
                -3.928149
            ],
            [
                38.985970500000036,
                -3.9283743
            ],
            [
                38.985781799999984,
                -3.9283555
            ],
            [
                38.98578710000001,
                -3.9281408999999994
            ],
            [
                38.98582809999999,
                -3.9281437
            ],
            [
                38.98584650000001,
                -3.9281449
            ],
            [
                38.9859768,
                -3.928149
            ]
        ],
        "flatCoordinates": [
            [
                -437279.5464401068,
                4719663.068515663
            ],
            [
                -437304.62672138255,
                4719662.166273555
            ],
            [
                -437302.5339149556,
                4719635.142011369
            ],
            [
                -437278.6447522313,
                4719635.901038422
            ],
            [
                -437278.9564468056,
                4719641.772759016
            ],
            [
                -437279.09003019455,
                4719644.407873753
            ],
            [
                -437279.5464401068,
                4719663.068515663
            ]
        ],
        "consumption": [
            4.5,
            3.7,
            2.9,
            2.5,
            2.3,
            2.1,
            2,
            1.9,
            1.8,
            1.7,
            1.6,
            1.5,
            1.5,
            1.4,
            1.5,
            1.6,
            1.7,
            1.8,
            1.9,
            2.1,
            2.3,
            2.6,
            3.2,
            3.7
        ],
        "transactions": {},
        "maxPanels": 312,
        "panels": 1
    },
    "Building 556053477": {
        "latitude": 38.98588920007077,
        "longitude": -3.9280376043217236,
        "altitude": 635.1846923828125,
        "address": "Calle Cruz, 4, 13001 Ciudad Real, Cdad. Real, Spain",
        "area": "357.32",
        "type": "Prosumer",
        "coordinates": [
            [
                38.9859893,
                -3.9279330000000003
            ],
            [
                38.9859768,
                -3.928149
            ],
            [
                38.98584650000001,
                -3.9281449
            ],
            [
                38.98584960000002,
                -3.928094
            ],
            [
                38.98582870000001,
                -3.928094
            ],
            [
                38.98582669999999,
                -3.9279960999999997
            ],
            [
                38.985789100000005,
                -3.9279919000000003
            ],
            [
                38.9857902,
                -3.927866
            ],
            [
                38.98581949999999,
                -3.9278647000000007
            ],
            [
                38.985818300000005,
                -3.9279183
            ],
            [
                38.9858686,
                -3.9279226
            ],
            [
                38.985868400000015,
                -3.9279491000000006
            ],
            [
                38.985888200000005,
                -3.9279518
            ],
            [
                38.98588939999999,
                -3.9279243999999998
            ],
            [
                38.9859893,
                -3.9279330000000003
            ]
        ],
        "flatCoordinates": [
            [
                -437255.50143009546,
                4719664.858678817
            ],
            [
                -437279.5464401068,
                4719663.068515663
            ],
            [
                -437279.09003019455,
                4719644.407873753
            ],
            [
                -437273.4238681132,
                4719644.8518333705
            ],
            [
                -437273.4238681132,
                4719641.858686661
            ],
            [
                -437262.5256899645,
                4719641.572261181
            ],
            [
                -437262.0581481032,
                4719636.187463737
            ],
            [
                -437248.0430242123,
                4719636.344997659
            ],
            [
                -437247.89830887434,
                4719640.541129533
            ],
            [
                -437253.8650335808,
                4719640.369274269
            ],
            [
                -437254.3437073912,
                4719647.572876602
            ],
            [
                -437257.2936738973,
                4719647.544234037
            ],
            [
                -437257.5942365224,
                4719650.37984828
            ],
            [
                -437254.5440824746,
                4719650.551703711
            ],
            [
                -437255.50143009546,
                4719664.858678817
            ]
        ],
        "consumption": [
            4.5,
            3.7,
            2.9,
            2.5,
            2.3,
            2.1,
            2,
            1.9,
            1.8,
            1.7,
            1.6,
            1.5,
            1.5,
            1.4,
            1.5,
            1.6,
            1.7,
            1.8,
            1.9,
            2.1,
            2.3,
            2.6,
            3.2,
            3.7
        ],
        "transactions": {},
        "maxPanels": 216,
        "panels": 1
    },
    "Building 556053473": {
        "latitude": 38.985909000058115,
        "longitude": -3.9278477910872605,
        "altitude": 635.5386962890625,
        "address": "Calle Cruz, 6, 13001 Ciudad Real, Cdad. Real, Spain",
        "area": "262.51",
        "type": "Producer",
        "coordinates": [
            [
                38.98599970000001,
                -3.9277641000000005
            ],
            [
                38.9859893,
                -3.9279330000000003
            ],
            [
                38.98588939999999,
                -3.9279243999999998
            ],
            [
                38.9858686,
                -3.9279226
            ],
            [
                38.985818300000005,
                -3.9279183
            ],
            [
                38.98581949999999,
                -3.9278647000000007
            ],
            [
                38.98582139999999,
                -3.927773
            ],
            [
                38.985878799999995,
                -3.9277721000000003
            ],
            [
                38.98591010000001,
                -3.9277693999999994
            ],
            [
                38.98599970000001,
                -3.9277641000000005
            ]
        ],
        "flatCoordinates": [
            [
                -437236.6995681005,
                4719666.348094803
            ],
            [
                -437255.50143009546,
                4719664.858678817
            ],
            [
                -437254.5440824746,
                4719650.551703711
            ],
            [
                -437254.3437073912,
                4719647.572876602
            ],
            [
                -437253.8650335808,
                4719640.369274269
            ],
            [
                -437247.89830887434,
                4719640.541129533
            ],
            [
                -437237.69031156856,
                4719640.81323371
            ],
            [
                -437237.5901240269,
                4719649.033647478
            ],
            [
                -437237.28956140165,
                4719653.516210414
            ],
            [
                -437236.6995681005,
                4719666.348094803
            ]
        ],
        "consumption": [
            4.5,
            3.7,
            2.9,
            2.5,
            2.3,
            2.1,
            2,
            1.9,
            1.8,
            1.7,
            1.6,
            1.5,
            1.5,
            1.4,
            1.5,
            1.6,
            1.7,
            1.8,
            1.9,
            2.1,
            2.3,
            2.6,
            3.2,
            3.7
        ],
        "transactions": {},
        "maxPanels": 263,
        "panels": 1
    },
    "Building 556053470": {
        "latitude": 38.98590315008852,
        "longitude": -3.9276438980133532,
        "altitude": 635.9384765625,
        "address": "Calle Cruz, 6, 13001 Ciudad Real, Cdad. Real, Spain",
        "area": "338.50",
        "type": "Consumer",
        "coordinates": [
            [
                38.9860151,
                -3.9275368
            ],
            [
                38.98599970000001,
                -3.9277641000000005
            ],
            [
                38.98591010000001,
                -3.9277693999999994
            ],
            [
                38.98590899999999,
                -3.9277371999999997
            ],
            [
                38.98588190000001,
                -3.9277371999999997
            ],
            [
                38.985878799999995,
                -3.9277721000000003
            ],
            [
                38.98582139999999,
                -3.927773
            ],
            [
                38.985791199999994,
                -3.9277734000000004
            ],
            [
                38.985792300000014,
                -3.9277049
            ],
            [
                38.98585829999999,
                -3.9277049
            ],
            [
                38.98585729999999,
                -3.9275991
            ],
            [
                38.985888200000005,
                -3.9276017999999997
            ],
            [
                38.985887700000035,
                -3.9275525
            ],
            [
                38.9860151,
                -3.9275368
            ]
        ],
        "flatCoordinates": [
            [
                -437211.3966478431,
                4719668.553576569
            ],
            [
                -437236.6995681005,
                4719666.348094803
            ],
            [
                -437237.28956140165,
                4719653.516210414
            ],
            [
                -437233.70507379813,
                4719653.358676215
            ],
            [
                -437233.70507379813,
                4719649.4776073005
            ],
            [
                -437237.5901240269,
                4719649.033647478
            ],
            [
                -437237.69031156856,
                4719640.81323371
            ],
            [
                -437237.7348393649,
                4719636.488210323
            ],
            [
                -437230.10945424554,
                4719636.6457442595
            ],
            [
                -437230.10945424554,
                4719646.097784652
            ],
            [
                -437218.3318521196,
                4719645.954571852
            ],
            [
                -437218.6324147447,
                4719650.37984828
            ],
            [
                -437213.1443638486,
                4719650.308241853
            ],
            [
                -437211.3966478431,
                4719668.553576569
            ]
        ],
        "consumption": [
            4.5,
            3.7,
            2.9,
            2.5,
            2.3,
            2.1,
            2,
            1.9,
            1.8,
            1.7,
            1.6,
            1.5,
            1.5,
            1.4,
            1.5,
            1.6,
            1.7,
            1.8,
            1.9,
            2.1,
            2.3,
            2.6,
            3.2,
            3.7
        ],
        "transactions": {},
        "maxPanels": 288,
        "panels": 1
    }
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
            if (timestamp in stateCloned[action.sender].transactions) {
                stateCloned[action.sender].transactions[timestamp].push([action.receiver, -action.energy]);
            } else {
                stateCloned[action.sender].transactions[timestamp] = [[action.receiver, -action.energy]];
            }

            if (timestamp in stateCloned[action.receiver].transactions) {
                stateCloned[action.receiver].transactions[timestamp].push([action.sender, +action.energy]);
            } else {
                stateCloned[action.receiver].transactions[timestamp] = [[action.sender, +action.energy]];
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
        default:
            return state;
    }

};


export default reducer;