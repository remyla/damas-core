class ErrorHandler( object ):
    
    def __init__(self, status_code):
        self.status_code = status_code
        self.error_codes = {
            # "201":{
            #     "/api/create/":["Created", "application/json (object or array of objects) created object(s)"]
            # },
            # "207":{
            #     "/api/create/":["", "application/json (object or array of objects) created object(s)"]
            # },
            "400":{
                "/api/create/":["Bad Request", "application/json (object or array of objects) created object(s)"],
                "/api/read/":["Bad Request", "text/html (error message) not formatted correctly"],
                "/api/update/":["Bad Request", "text/html (error message) not formatted correctly"]
            },
            "403":{
                "/api/create/":["Forbidden", "application/json (object or array of objects) created object(s)"],
                "/api/read/":["Forbidden", "text/html (error message) the user does not have the right permission"],
                "/api/update/":["Forbidden", "text/html (error message) the user does not have the right permission"]
            },
            "404":{
                "/api/read/":["Not Found", "text/html (error message) object(s) do not exist"],
                "/api/update/":["Not Found", "text/html (error message) object(s) do not exist"]
            },
            "409":{
                "/api/create/":["Conflict", "application/json (object or array of objects) created object(s)"]
            },
            "500":{
                "/api/create/":["Internal Server Error", "application/json (object or array of objects) created object(s)"],
                "/api/read/":["Internal Server Error", "text/html (error message) error while accessing the database"],
                "/api/update/":["Internal Server Error", "text/html (error message) error while accessing the database"]
            }
        }

    def handler(self, endpoint):
        if self.status_code in self.error_codes:
            if endpoint in self.error_codes[self.status_code]:
                error_response = self.error_codes[self.status_code][endpoint]
                return f"{self.status_code}: {error_response[0]} | {error_response[0]}"
        return f"{self.status_code}: Error occured"