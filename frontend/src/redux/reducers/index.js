import { combineReducers } from "redux";
import buildingReducer from "./buildingReducer";
import gridReducer from "./gridReducer";

export default combineReducers({
    buildings: buildingReducer,
    grid: gridReducer,
});