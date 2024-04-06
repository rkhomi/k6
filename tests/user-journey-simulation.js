import http from 'k6/http';
import { check, sleep } from 'k6';
import {largePayload} from '../property-payload.js'
import { login, getAuthHeaders } from '../helper.js'


export let options = {
    stages: [
        { duration: '10s', target: 50 }, 
        { duration: '30s', target: 50 }, 
        { duration: '10s', target: 0 }, 
    ],
    thresholds: {
        'http_req_duration': ['max<30000'],
    },
};
export default function () {

    const loginBody = login()



    const userResponse = http.get('https://api.tc.loc/auth/user', getAuthHeaders(loginBody.access_token))
    check(userResponse, {
        'user response time within 30s': r => r.timings.duration < 30000,
        'user status 200': (r) => r.status === 200,
    });

    const propertyResponse = http.post(`https://api.tc.loc/landlord/property`, largePayload, getAuthHeaders(loginBody.access_token));
    check(propertyResponse, {
        'property create response time within 30s': r => r.timings.duration < 30000,
        'property status 201': (r) => r.status === 201,
    });

    const logoutResponse = http.del('https://api.tc.loc/auth/logout?uuid=', null,getAuthHeaders(loginBody.access_token))
    check(logoutResponse, {
        'logout response time within 30s': r => r.timings.duration < 30000,
        'logout status 204': (r) => r.status === 204,
    });

    const userResponse2 = http.get('https://api.tc.loc/auth/user', getAuthHeaders(loginBody.access_token))
    check(userResponse2, {
        'user status 401': (r) => r.status === 401,
    });


}