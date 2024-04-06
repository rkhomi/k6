import http from 'k6/http';
export const login = (email = 'll@tenantcloud.com') => {
    const payload = JSON.stringify({
        email,
        fingerprint: 'fingerprint',
        password: 'propertY12345',
        remember: false,
        'g-recaptcha-response': 'recaptcha_some_token',
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'TC-CAPTCHA-TOKEN': 'tc_recaptcha_disable_token',
        },
    };
    const loginResponse = http.post(`https://api.tc.loc/auth/login`, payload, params);

    return  loginResponse.json();
}

export const getAuthHeaders = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
            'Content-Type': 'application/json',
        },
    }
}