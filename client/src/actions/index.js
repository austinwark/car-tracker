import * as actionTypes from './types';

/* User Actions */
export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER
    }
}

/* Query Actions */
export const setCurrentQuery = query => {
    return {
        type: actionTypes.SET_CURRENT_QUERY,
        payload: {
            currentQuery: query
        }
    }
}

/* Notification Actions */
export const setCurrentNotification = notification => {
    return {
        type: actionTypes.SET_CURRENT_NOTIFICATION,
        payload: {
            currentNotification: notification
        }
    }
}

export const clearCurrentNotification = () => {
    return {
        type: actionTypes.CLEAR_CURRENT_NOTIFICATION
    }
}

/* Side Panel & MetaPanel Control */

export const toggleSidePanel = () => {
    return {
        type: actionTypes.TOGGLE_SIDE_PANEL
    }
}

export const toggleMetaPanel = () => {
    return {
        type: actionTypes.TOGGLE_META_PANEL
    }
}

/* Window Size */

export const setWindowSize = windowDimensions => {
    return {
        type: actionTypes.SET_WINDOW_SIZE,
        payload: {
            windowDimensions
        }
    }
}