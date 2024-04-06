import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { login, getAuthHeaders } from '../helper.js'

// Run once before the tests
export function setup() {
    const body = login()
    return { token: body.access_token };
}
export let options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minutes
        { duration: '2m', target: 100 }, // Stay at 100 users for 2 minutes
        { duration: '1m', target: 0 }, // Ramp down to 0 users over 1 minutes
    ],
    thresholds: {
        'http_req_duration': ['max<30000'],
    },
};
export default function (data) {

    const payload = JSON.stringify({
        data: {
            attributes: {
                browser: 2,
                device_type: 1,
                message: '<p>ticket description</p>',
                subject: 'Ticket title',
                type: 1,
            },
            type: 'feedback',
        },
    });

    const url = new URL('https://api.tc.loc/feedbacks');
    url.searchParams.append('fields[feedback]', 'subject,status,created_at,type,rating');
    url.searchParams.append('fields[user]', 'firstName,name');
    url.searchParams.append('include', 'support,support.avatar');

    const response = http.post(`https://api.tc.loc/feedbacks`, payload, getAuthHeaders(data.token));

    check(response, {
        'create response time within 30s': r => r.timings.duration < 30000,
    });

    sleep(1);

    const listResponse =  http.get(url.toString(), getAuthHeaders(data.token))

    check(listResponse, {
        'list response time within 30s': r => r.timings.duration < 30000,
    });

}