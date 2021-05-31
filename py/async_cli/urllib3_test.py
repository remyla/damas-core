import io
import json

import urllib3


def main(url):
    http = urllib3.PoolManager()
    get = 'GET'
    post = 'POST'
    # print()
    # print()
    # print("========================================== get_request ==========================================")
    # get_request = http.request(get, url)
    # print("url =  {}".format(url))
    # print("get_request.data = {}".format(get_request.data))
    # print("get_request.status = {}".format(get_request.status))
    # print("get_request.headers = {}".format(get_request.headers))
    # print()
    # print()
    # print("========================================== post_request ==========================================")
    # post_request = http.request(
    #     post,
    #     url,
    #     fields={'hello': 'world'}
    # )
    # print("url =  {}".format(url))
    # print("post_request.data = {}".format(post_request.data))
    # print("post_request.status = {}".format(post_request.status))
    # print("post_request.headers = {}".format(post_request.headers))
    # print()
    # print()
    print("========================================== json content ==========================================")
    headers = {'content-type': 'application/json'}
    search_query = "*"
    # json_element =
    data = json.dumps(search_query)
    print("{object}is type of {type}".format(type=type(json.dumps(search_query)), object=json.dumps(search_query)))
    r = http.request(get, "http://localhost:8090/api/search/*")
    # r = http.request(get, url + "/api/search/" + search_query)
    # r = http.request(get, url + "/api/search/" + search_query, headers=headers, verify=False)
    # r = requests.get(self.serverURL + '/api/search/' + search_query, headers=self.headers, verify=False)
    string_json_data = r.data.decode('utf-8')
    print(type(string_json_data))
    print("hello" + string_json_data)
    loads = json.loads(string_json_data)
    print(loads)
    print()
    print()
    print("============================== Using io Wrappers with Response Content ==============================")
    r = http.request(get, url, preload_content=False)
    r.auto_close = False
    for line in io.TextIOWrapper(r): print(line)


if __name__ == '__main__':
    url = 'http://httpbin.org/ip'
    lh = 'http://localhost:8090'
    # main(url)
    main(lh)
