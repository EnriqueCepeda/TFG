
import { ADD_BUILDING, REMOVE_BUILDING, UPDATE_BUILDING_TYPE, UPDATE_BUILDING_CONSUMPTION, ADD_TRANSACTION, UPDATE_BUILDING_ADDRESS } from '../actions/types';
import _ from "lodash";


let initialState = {}

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
            debugger;
            stateCloned[action.sender].transactions[action.timestamp] = [action.receiver, -action.energy];
            stateCloned[action.receiver].transactions[action.timestamp] = [action.sender, action.energy];
            return stateCloned;
        }
        default:
            return state;
    }

};


export default reducer;