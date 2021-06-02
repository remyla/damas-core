from sseclient import SSEClient


def do_something_useful(url):
    messages = SSEClient(url).resp
    print(messages)
    print("url = {}".format(messages.url))
    print("messages = SSEClient(url) is null ? : {}".format(messages == None))
    print("requests_kwargs = {}".format(messages.requests_kwargs))
    print("respnse = {}".format(messages.resp))
    print("iter_content = {}".format(messages.iter_content()))
    # messages.__next__()
    # print("__next__ is null? : {}".format(    messages.__next__() == None))
    print("buf = {}".format(messages.buf))
    for msg in messages:
        print(msg)


def main():
    do_something_useful('http://localhost:8090')


if __name__ == '__main__':
    main()