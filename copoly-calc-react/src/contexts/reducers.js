import { UPDATE_FUNC } from "./actions";

export const reducer = (state, { type }) => {
    console.log(state);

    switch(type)
    {
        case UPDATE_FUNC:
            return { ...state };

        default:
            return state;
    }
}