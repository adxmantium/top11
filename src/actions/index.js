// /actions/index.js

import axios from 'axios'

const routes = {
	teams: '/teams',
  top11: '/top11',
  formations: '/formations',
}

const getTeams = () => axios.get(routes.teams);
const getTop11 = () => axios.get(routes.top11);
const getFormations = () => axios.get(routes.formations);

export const initData = () => {
  const pending = 'fetching_init_data',
        done = 'fetched_init_data';

	return (dispatch) => {
	    dispatch( pendingAction({ pending, type: pending.toUpperCase() }) );

      axios.all([ getTeams(), getTop11(), getFormations() ])
           .then( axios.spread((teams, top11, formations) => {

            const action = {
               type: `_APP:${done.toUpperCase()}`,
               payload: {
                  ...teams.data,
                  ...top11.data,
                  ...formations.data,
               },
            }

            dispatch( action );

           }) )
           .catch( err => dispatch( errAction({ pending, err }) ) );
	}
}

const pendingAction = ({ pending, type, data = {} }) => ({
  type: `_APP:${type || 'GET_REQUEST_PENDING'}`,
  payload: {
    ...data,
    [pending]: true,
    [pending+'_err']: false,
  }
})

const errAction = ({ pending, err }) => ({
  type: '_APP:GET_REQUEST_PENDING_ERR',
  payload: {
    [pending]: false,
    [pending+'_err']: err,
  }
})