import { combineReducers } from "redux";
import buildingReducer from "./buildingReducer";

export default combineReducers({
    buildings: buildingReducer
});