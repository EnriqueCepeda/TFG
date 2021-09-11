import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers/index";

const middleware = [thunk];
const initialState = {};

const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk)
);

export default store;