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
    currentQuery: null,
    isLoading: true
}

const query_reducer = (state = initialQueryState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_QUERY:
            return {
                ...state,
                currentQuery: action.payload.currentQuery,
                isLoading: false
            };
        default:
            return state;
    }
}

const initialNotificationState = {
    currentNotification: null
}

const notification_reducer = (state = initialNotificationState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_NOTIFICATION:
            return {
                ...state,
                currentNotification: action.payload.currentNotification
            };
        case actionTypes.CLEAR_CURRENT_NOTIFICATION:
            return {
                ...state,
                currentNotification: null
            }
        default:
            return state;
    }
}

const initialPanelState = {
    sidePanelOpen: false,
    metaPanelOpen: false
}

const panel_reducer = (state = initialPanelState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_SIDE_PANEL:
            return {
                ...state,
                sidePanelOpen: !state.sidePanelOpen,
                metaPanelOpen: false
            }
        case actionTypes.TOGGLE_META_PANEL:
            return {
                ...state,
                metaPanelOpen: !state.metaPanelOpen,
                sidePanelOpen: false
            }
        default:
            return state
    }
}

const initialWindowState = {
    windowDimensions: {
        width: 0,
        height: 0
    }
};

const window_reducer = (state = initialWindowState, action) => {
    switch (action.type) {
        case actionTypes.SET_WINDOW_SIZE:
            return {
                windowDimensions: action.payload.windowDimensions
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    user: user_reducer,
    query: query_reducer,
    notification: notification_reducer,
    panel: panel_reducer,
    window: window_reducer
})

export default rootReducer;