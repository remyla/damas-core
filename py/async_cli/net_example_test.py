def myfun(arg1, **kwargs):
    print(arg1)
    for key, value in kwargs.items():
        print("%s == %s" % (key, value))


def main():
    myfun("Hi", first='Geeks', mid='for', last='Geeks')


if __name__ == '__main__':
    main()