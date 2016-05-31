
var utils = {
    /**
     * Tells whether the request contains an array
     * @param {object} req - The Express request to process
     * @return {boolean} - Whether the request contains an array
     */
    isArray: function (req) {
        if (req.params.id) {
            return 1 < req.params.id.split(',');
        }
        return Array.isArray(req.body);
    },

    /**
     * Extract the ids from the request
     * @param {object} req - The Express request to process
     * @return {array|false} - The ids of the request, false on failure
     */
    getRequestIds: function (req) {
        if (req.params.id) {
            return req.params.id.split(',');
        } else if (req.body) {
            var ids = Array.isArray(req.body) ? req.body : [req.body];
            return ids.some(elem => 'string' !== typeof elem) ? false : ids;
        }
        return false;
    },

    /**
     * Send the desired HTTP status code
     * @param {object} res - The Express response object receiving the data
     * @param {integer} code - The wanted HTTP status code (< 300 for success)
     * @param {} data - The data to send on success, a error heading otherwise
     */
    httpStatus: function (res, code, data) {
        res.status(code);
        if (code < 300) {
            res.json(data);
            return;
        }
        var e = data + ' error: ';
        switch (code) {
            case 400: e += 'Bad request (empty or not well-formed)'; break;
            case 401: e += 'Unauthorized (authentication required)'; break;
            case 403: e += 'Forbidden (permission required)'; break;
            case 404: e += 'Not found'; break;
            case 409: e += 'Conflict'; break;
            case 501: e += 'Not implemented (contact an administrator)'; break;
            default:  e += 'Unknown error code';
        }
        res.send(e);
    },

    /**
     * Tells whether a response is failed or incomplete (contains null?)
     * @param {array} doc - the database response
     * @return {{fail: boolean, partial: boolean}} - the results to send
     */
    getMultipleResponse: function (doc) {
        var result = { fail: true, partial: false };
        for (var i in doc) {
            if (null === doc[i]) {
                result.partial = true;
            } else {
                result.fail = false;
            }
        }
        return result;
    }
}

// Extend the global Node object (add these methods to the global context)
global.isArray = utils.isArray;
global.getRequestIds = utils.getRequestIds;
global.httpStatus = utils.httpStatus;
global.getMultipleResponse = utils.getMultipleResponse;

