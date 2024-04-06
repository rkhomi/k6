import http from 'k6/http';
import { check } from 'k6';
import { smallPayload, mediumPayload, largePayload } from '../property-payload.js'
import { login, getAuthHeaders } from '../helper.js'

// Run once before the tests
export function setup() {
    const body = login()
    return { token: body.access_token };
}
export default function (data) {

    const payloads = [smallPayload, mediumPayload, largePayload]
    payloads.forEach(payload => {
        const response = http.post(`https://api.tc.loc/landlord/property`, payload, getAuthHeaders(data.token));

        check(response, {
            'create response time within 30s': r => r.timings.duration < 30000,
        });
    })

}