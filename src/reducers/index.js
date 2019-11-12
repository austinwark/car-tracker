import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';

const initialUserState = {
    currentUser: null,
    isLoading: true
};

const user_reducer = (state = initialUserState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        case actionTypes.CLEAR_USER:
            return {
                ...initialUserState,
                isLoading: false
            }
        default:
            return state;
    }
}

const initialQueryState = {
    currentQuery: null
}

const query_reducer = (state = initialQueryState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_QUERY:
            return {
                ...state,
                currentQuery: action.payload.currentQuery
            };
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    user: user_reducer,
    query: query_reducer
})

export default rootReducer;