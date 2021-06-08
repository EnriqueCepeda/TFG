import { ADD_GRID } from '../actions/types';
import _ from "lodash";


let initialState = {}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_GRID: {
            let stateCloned = _.cloneDeep(state);
            stateCloned.id = action.grid_id;
            return stateCloned;
        }
        default:
            return state;
    }

};


export default reducer;