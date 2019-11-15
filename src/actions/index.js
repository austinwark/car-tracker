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