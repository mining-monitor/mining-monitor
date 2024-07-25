import * as CryptoJS from "crypto-js"
import { XMLHttpRequest } from "xmlhttprequest-ts"
import { sleep } from "../../utils"

interface Request {
    method: string,
    url: string,
    username: string,
    password: string,
    data?: string,
    retryCount?: number,
    contentType?: string,
    timeout?: number,
}

export const digestAuthRequestAsync = async (request: Request): Promise<[object | null, number]> => {
    const getRequest = digestAuthRequest(
        request.method,
        request.url,
        request.username,
        request.password,
        request.timeout)

    let response: object | null = null
    let responseCode: number | null = null
    const retryCount = request.retryCount || 5

    for (let i = 0; i < retryCount; i++) {
        response = null
        responseCode = null

        getRequest.request((responseData: object | null) => {
            response = responseData
            responseCode = 200
        }, function (errorCode: number) {
            responseCode = errorCode || 404
        }, request.data, request.contentType);

        while (responseCode === null) {
            await sleep(100)
        }

        if (responseCode === 200) {
            break
        }
    }

    return [response, responseCode!]
}

const digestAuthRequest = (method: string, url: string, username: string, password: string, timeout?: number): any => {
    const self = {} as any;

    self.scheme = null; // we just echo the scheme, to allow for 'Digest', 'X-Digest', 'JDigest' etc
    self.nonce = null; // server issued nonce
    self.realm = null; // server issued realm
    self.qop = null; // "quality of protection" - '' or 'auth' or 'auth-int'
    self.response = null; // hashed response to server challenge
    self.opaque = null; // hashed response to server challenge
    self.nc = 1; // nonce count - increments with each request used with the same nonce
    self.cnonce = null; // client nonce

    // settings
    self.timeout = timeout || 1000; // timeout
    self.loggingOn = false; // toggle console logging

    // determine if a post, so that request will send data
    self.post = false;
    if (method.toLowerCase() === 'post' || method.toLowerCase() === 'put') {
        self.post = true;
    }

    // start here
    // successFn - will be passed JSON data
    // errorFn - will be passed error status code
    // data - optional, for POSTS
    self.request = function (successFn: () => string | null, errorFn: () => number, data: object | string, contentType: string) {
        // posts data as JSON if there is any
        if (data) {
            self.contentType = contentType || 'application/json'
            self.data = self.contentType === 'application/json' ? JSON.stringify(data) : data;
        }
        self.successFn = successFn;
        self.errorFn = errorFn;

        if (!self.nonce) {
            self.makeUnauthenticatedRequest();
        } else {
            self.makeAuthenticatedRequest();
        }
    }
    self.makeUnauthenticatedRequest = function () {
        self.firstRequest = new XMLHttpRequest();
        self.firstRequest.open(method, url, true);
        self.firstRequest.timeout = self.timeout;
        // if we are posting, add appropriate headers
        if (self.post) {
            self.firstRequest.setRequestHeader('Content-type', self.contentType);
        }

        self.firstRequest.onreadystatechange = function () {

            // 2: received headers,  3: loading, 4: done
            if (self.firstRequest.readyState === 2) {

                var responseHeaders = self.firstRequest.getAllResponseHeaders();
                responseHeaders = responseHeaders.split('\n');
                // get authenticate header
                var digestHeaders;
                for (var i = 0; i < responseHeaders.length; i++) {
                    if (responseHeaders[i].match(/www-authenticate/i) != null) {
                        digestHeaders = responseHeaders[i];
                    }
                }

                if (digestHeaders != null) {
                    // parse auth header and get digest auth keys
                    digestHeaders = digestHeaders.slice(digestHeaders.indexOf(':') + 1, -1);
                    digestHeaders = digestHeaders.split(',');
                    self.scheme = digestHeaders[0].split(/\s/)[1];
                    for (var i = 0; i < digestHeaders.length; i++) {
                        var equalIndex = digestHeaders[i].indexOf('='),
                            key = digestHeaders[i].substring(0, equalIndex),
                            val = digestHeaders[i].substring(equalIndex + 1);
                        val = val.replace(/['"]+/g, '');
                        // find realm
                        if (key.match(/realm/i) != null) {
                            self.realm = val;
                        }
                        // find nonce
                        if (key.match(/nonce/i) != null) {
                            self.nonce = val;
                        }
                        // find opaque
                        if (key.match(/opaque/i) != null) {
                            self.opaque = val;
                        }
                        // find QOP
                        if (key.match(/qop/i) != null) {
                            self.qop = val;
                        }
                    }
                    // client generated keys
                    self.cnonce = self.generateCnonce();
                    self.nc++;
                    // if logging, show headers received:
                    self.log('received headers:');
                    self.log('	realm: ' + self.realm);
                    self.log('	nonce: ' + self.nonce);
                    self.log('	opaque: ' + self.opaque);
                    self.log('	qop: ' + self.qop);
                    // now we can make an authenticated request
                    self.makeAuthenticatedRequest();
                }
            }
            if (self.firstRequest.readyState === 4) {
                if (self.firstRequest.status === 200) {
                    self.log('Authentication not required for ' + url);
                    if (self.firstRequest.responseText !== 'undefined') {
                        if (self.firstRequest.responseText.length > 0) {
                            // If JSON, parse and return object
                            if (self.isJson(self.firstRequest.responseText)) {
                                self.successFn(JSON.parse(self.firstRequest.responseText));
                            } else {
                                self.successFn(self.firstRequest.responseText);
                            }
                        }
                    } else {
                        self.successFn();
                    }
                }
            }
        }
        // send
        if (self.post) {
            // in case digest auth not required
            self.firstRequest.send(self.data);
        } else {
            self.firstRequest.send();
        }
        self.log('Unauthenticated request to ' + url);

        // handle error
        self.firstRequest.onerror = function () {
            if (self.firstRequest.status !== 401) {
                self.log('Error (' + self.firstRequest.status + ') on unauthenticated request to ' + url);
                self.errorFn(self.firstRequest.status);
            }
        }
    }
    self.makeAuthenticatedRequest = function () {

        self.response = self.formulateResponse();
        self.authenticatedRequest = new XMLHttpRequest();
        self.authenticatedRequest.open(method, url, true);
        self.authenticatedRequest.timeout = self.timeout;
        var digestAuthHeader = self.scheme + ' ' +
            'username="' + username + '", ' +
            'realm="' + self.realm + '", ' +
            'nonce="' + self.nonce + '", ' +
            'uri="' + url + '", ' +
            'response="' + self.response + '", ' +
            'opaque="' + self.opaque + '", ' +
            'qop=' + self.qop + ', ' +
            'nc=' + ('00000000' + self.nc).slice(-8) + ', ' +
            'cnonce="' + self.cnonce + '"';
        self.authenticatedRequest.setRequestHeader('Authorization', digestAuthHeader);
        self.log('digest auth header response to be sent:');
        self.log(digestAuthHeader);
        // if we are posting, add appropriate headers
        if (self.post) {
            self.authenticatedRequest.setRequestHeader('Content-type', self.contentType);
        }
        self.authenticatedRequest.onload = function () {
            // success
            if (self.authenticatedRequest.status >= 200 && self.authenticatedRequest.status < 400) {
                // increment nonce count
                self.nc++;
                // return data
                if (self.authenticatedRequest.responseText !== 'undefined' && self.authenticatedRequest.responseText.length > 0) {
                    // If JSON, parse and return object
                    if (self.isJson(self.authenticatedRequest.responseText)) {
                        self.successFn(JSON.parse(self.authenticatedRequest.responseText));
                    } else {
                        self.successFn(self.authenticatedRequest.responseText);
                    }
                } else {
                    self.successFn();
                }
            }
            // failure
            else {
                self.nonce = null;
                self.errorFn(self.authenticatedRequest.status);
            }
        }
        // handle errors
        self.authenticatedRequest.onerror = function () {
            self.log('Error (' + self.authenticatedRequest.status + ') on authenticated request to ' + url);
            self.nonce = null;
            self.errorFn(self.authenticatedRequest.status);
        };
        // send
        if (self.post) {
            self.authenticatedRequest.send(self.data);
        } else {
            self.authenticatedRequest.send();
        }
        self.log('Authenticated request to ' + url);
    }
    // hash response based on server challenge
    self.formulateResponse = function () {
        var HA1 = CryptoJS.MD5(username + ':' + self.realm + ':' + password).toString();
        var HA2 = CryptoJS.MD5(method + ':' + url).toString();
        var response = CryptoJS.MD5(HA1 + ':' +
            self.nonce + ':' +
            ('00000000' + self.nc).slice(-8) + ':' +
            self.cnonce + ':' +
            self.qop + ':' +
            HA2).toString();
        return response;
    }
    // generate 16 char client nonce
    self.generateCnonce = function () {
        var characters = 'abcdef0123456789';
        var token = '';
        for (var i = 0; i < 16; i++) {
            var randNum = Math.round(Math.random() * characters.length);
            token += characters.substr(randNum, 1);
        }
        return token;
    }
    self.abort = function () {
        self.log('[digestAuthRequest] Aborted request to ' + url);
        if (self.firstRequest != null) {
            if (self.firstRequest.readyState != 4) self.firstRequest.abort();
        }
        if (self.authenticatedRequest != null) {
            if (self.authenticatedRequest.readyState != 4) self.authenticatedRequest.abort();
        }
    }
    self.isJson = function (str: any) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    self.log = function (str: string) {
        if (self.loggingOn) {
            console.log('digestAuthRequest', str);
        }
    }
    self.version = function () { return '0.8.0' }

    return self
}