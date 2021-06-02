import json


def as_complex(dct):
    if '__complex__' in dct:
        return complex(dct['real'], dct['imag'])
    return dct


def main():
    # json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}])
    # print(json.dumps("\"foo\bar"))
    # json.loads('{"__complex__": true, "real": 1, "imag": 2}', object_hook=as_complex)
    person_data = '{  "person":  { "name":  "Kenn",  "sex":  "male",  "age":  28}}'
    dict_obj = json.loads(person_data)
    print("dict_obj = {} is an {}".format(dict_obj,type(dict_obj)))
    print("person_data = {} is an {}".format(person_data,type(person_data)))


if __name__ == '__main__':
    main()