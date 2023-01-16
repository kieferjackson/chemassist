import { UPDATE_FUNC } from "./actions";

export const reducer = (state, { type, value }) => {
    console.log(state);

    switch(type)
    {
        case UPDATE_FUNC:
            console.log('Given value to update Context: ', value);
            return value;

        default:
            return state;
    }
}