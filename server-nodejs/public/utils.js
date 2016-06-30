/**
 * Get a multiline text description of the element
 * @return {string} the text string of the element compound of its label, tags
 * and keys/values pairs, with \n carriage returns as line separators.
 */
JSON_tooltip = function ( obj )
{
    var text = '';
    var keys = Object.keys(obj).sort();
    for (i = 0; i < keys.length ; i++){
        text += " (" + typeof obj[keys[i]] + ") " + keys[i] + "  : " + obj[keys[i]];
        if (i !== keys.length - 1) {
            text += '\n';
       }
    }
    return text;
}

/**
 * Take care of the connection, on top of damas.js. The token is store in the
 * localStorage.
 * @param {string} server_url
 * @param {function} callback 
 *
 */
damas_connect = function (server_url, callback)
{
    damas.server = server_url;
    if (localStorage) {                                                                                                              
        damas.token = localStorage.getItem("token");
    }
    damas.verify(callback);
}
