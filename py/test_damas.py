import damas

empty_node = {}
element_with_auto_enerated_id = {"key1": "value1"}
elt_with_specified_identifier = {"_id": "/project/folder/file", "additional_key": "value"}
two_elements = {"_id": ["identifier1", "identifier2"], "key": "keyvalue"}
two_elements_using_an_array_as_id = {"_id": ["identifier1", "identifier2"], "key": "keyvalue"}
graph_edge_element = {"_id": "/project/folder/file1", "tgt_id": "/project/folder/file2"}
nodes = [
    empty_node,
    element_with_auto_enerated_id,
    elt_with_specified_identifier,
    two_elements,
    two_elements_using_an_array_as_id,
    graph_edge_element
]
id1 = elt_with_specified_identifier['_id']
id2 = two_elements['_id']
id3 = two_elements_using_an_array_as_id['_id']
id4 = graph_edge_element['_id']
ids = [id1, id2, id3, id4]


def main():
    project = damas.http_connection("http://localhost:8090")
    project.search("*")
    project.read(project.search("*"))
    for n in nodes: project.create(n)
    all = project.search("*")
    print(all)
    project.read(project.search("*"))


if __name__ == '__main__':
    main()
