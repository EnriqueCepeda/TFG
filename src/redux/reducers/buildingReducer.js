
import { ADD_BUILDING, REMOVE_BUILDING, UPDATE_BUILDING_TYPE } from '../actions/types'

const initialState = {
    "Building 562077433": {
        "longitude": 38.98679890008654,
        "latitude": -3.9270577033021428,
        "area": "884.28",
        "type": "Consumer & Producer"
    }
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_BUILDING_TYPE: {
            let stateCloned = Object.assign({}, state);
            stateCloned[action.building_id].type = action.building_type;
            return stateCloned;
        }
        case ADD_BUILDING: {
            let stateCloned = Object.assign({}, state);
            stateCloned[action.building_id] = action.building_data;
            return stateCloned;
        }
        case REMOVE_BUILDING: {
            let stateCloned = Object.assign({}, state);
            delete stateCloned[action.building_id]
            return stateCloned;
        }
        default:
            return state;
    }

};


export default reducer;