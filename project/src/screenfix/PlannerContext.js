import React, { createContext, useReducer ,useState} from "react";

export const PlannerContext = createContext();

const PlannerReducer = (state, action) => {

    switch(action.type){

        case 'ADD_ITEM':

            const overlap = state.find(item =>
                item.day === action.payload.day &&
                item.hour === action.payload.hour &&
                item.minute === action.payload.minute
            );

            if(overlap){
                return state
            }

            return [
                {
                    ...action.payload,
                    id: Date.now().toString()
                },
                ...state
            ]

        default:
            return state;
    }
}

export const PlannerProvider = ({ children }) => {

    const [items, dispatch] = useReducer(PlannerReducer, [])

    const [userID, setUserID] = useState(null);

    return(
        <PlannerContext.Provider value={{ items, dispatch,setUserID,userID }}>
            {children}
        </PlannerContext.Provider>
    )
}