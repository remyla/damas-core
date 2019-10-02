# damas-core Python API

Install the `requests` module:

> with pip:
```sh
pipenv install requests
```

> or with Debian:
```sh
apt install python-requests
```

Then import damas.py and connect to a server:

```python
import damas

# connect to the demo server
project = damas.http_connection("https://demo.damas.io")

```

See https://demo.damas.io/py/ for usage and testing.
See https://github.com/remyla/damas-core/wiki for API reference.
