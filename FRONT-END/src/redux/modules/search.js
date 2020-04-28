import { handleActions, createAction } from 'redux-actions';
import * as SearchAPI from 'lib/api/search';

import { Map, List } from 'immutable';
import { pender } from 'redux-pender';

const CHANGE_INPUT = 'SEARCH/CHANGE_INPUT'; // getting search input value
const SEARCH_GROUP = 'SEARCH/SEARCH_GROUP'; // getting searcing of result

export const changeInput = createAction(CHANGE_INPUT); //  { name, value }
export const searchGroup = createAction(SEARCH_GROUP, SearchAPI.groupByKeywords); //  { keywords }


const initialState = Map({
  keywords: '',
  keyword: '',
  result: []
})

export default handleActions({
  [CHANGE_INPUT]: (state, action) => {
      const { name, value } = action.payload;
      return state.set( name, value );
  },
  ...pender({
      type: SEARCH_GROUP,
      onSuccess: (state, action) => state.set('result', action.payload.data.groupList)
  }),
}, initialState);