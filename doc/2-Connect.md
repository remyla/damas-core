Connect
=======
This page explains how to connect to an existing server. You can use the public server https://demo.damas.io to test connecting the clients. Read the [Installation Guide](1-Installation.md) to setup a new server.

# Python
Visit [/py](/py) on this server or https://demo.damas.io/py/ to get some instructions about how to connect to the demo server using python or follow the instructions below.

`damas_client.py` is a module containing the damas-core client API for Python. It is located under `/py/damas_client.py` in the damas-core repository. It depends on the `requests` module. On a Debian operating system you can install the `request` module using this command line:
```sh
$ sudo apt install python-requests
```

```python
# Example use in a Python console
# import the module
>>> import damas_client
```

Then connect to a running server and start working with the nodes:

```python
# connect to the server
>>> project = damas.http_connection('https://demo.damas.io')

# create a new element
>>> project.create({"key1":"value1","key2":"value2"})
{u'key2': u'value2', u'key1': u'value1', u'time': 1437469470133, u'_id': u'55ae0b1ed81e88357d77d0e9', u'author': u'xxx.xxx.xxx.xxx'}

# search for this element using the key it is wearing
>>> project.search("key1:value1")
[u'55ae0b1ed81e88357d77d0e9']

# read the node index
>>> project.read('55ae0b1ed81e88357d77d0e9')
[{u'key2': u'value2', u'key1': u'value1', u'time': 1437469470133, u'_id': u'55ae0b1ed81e88357d77d0e9', u'author': u'xxx.xxx.xxx.xxx'}]
```


# Javascript
https://demo.damas.io/js/ has the Javascript damas-core client API loaded and ready to try it with the demo server using a web browser.

`/js/damas.js` in the damas-core repository is an AMD module containing the client API for Javascript. This module can be loaded in various environments.

## In HTML Documents
Include the library from a HTML document
```html
<html>
    <head>
        <script src="damas.js"></script>
        <script>
            damas.server = ''; // your server URL
            // your code here
        </script>
    </head>
    <body>
    </body>
</html>
```
> damas.server is set to an empty string if your page is directly served by damas-core

## Using requireJS
```js
require('damas.js');
damas.server = ''; // the server is on the localhost
damas.signIn("demoUser", "demoUserPassword", function(res){
    if (!res) {
        // login failed
        return;
    }
    damas.create({"key1":"value1","key2":"value2"});
});
```
Under NodeJS, the `xmlhttprequest` module is required:
```sh
npm install xmlhttprequest
```
Also, CustomEvent is used in this module. Comment the 2 lines invoking CustomEvent if needed under NodeJS. This module would become a ready-to-use npm module if we get more clients using NodeJS.  


# Command-line Interface
https://demo.damas.io/cli/ gives explanations about the bash client and how to try it with the demo server.

## Install the `damas` command on your system
Install from this repository:
```sh
cp cli/damas /usr/bin/damas
```
Install from the gitHub repository:
```sh
sudo curl -L "https://raw.githubusercontent.com/remyla/damas-core/experimental/cli/damas.sh)" -o /usr/bin/damas
```
Then make the command executable:
```sh
chmod +x /usr/bin/damas
```

The manual page of the command can be found at https://demo.damas.io/cli/ or in this repository under `/cli/README.md`.

If the server requires authentication (the demo server has no authentication) you can use `damas signin <username> <password>` command to get a token which is stored in `/tmp/damas-<username>'. Only root and you can read it and it is removed whenever the system reboots

# Next steps
Now that you have a running server and client environments you could continue reading the [API Reference](3-API-Reference.md) and the [Specifications](4-Specifications.md).

If you encounter any difficulty you could create an issue describing the problem in this repository and we will try to solve it.
