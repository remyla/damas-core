<img src="http://damas-software.com/bin/damas_logo.png" alt="damas-core"/>

http://damas-software.org

# damas-core/server-php

* RESTful HTTP stateless server written in Php
* Key-value data model and directed graph for MySQL

## Installation

GNU/Debian packages:

php5 php5-mysql mysql-server apache2

* retrieve damas-core using git:
```sh
$ git clone https://github.com/remyla/damas-core.git
```
* in MySQL, create a database:
```
&gt; CREATE DATABASE damasdb;
```
⋅⋅⋅and import the table structure: 
```
$ mysql damasdb < damas_init.sql
```

* rename settings_install.php to settings.php and edit it to match your configuration

* customize your php.ini to match your needs (Increase the duration of sessions to 90 days before timeout, maximum post size and file size to 200M):

```ini
; After this number of seconds, stored data will be seen as 'garbage' and
; cleaned up by the garbage collection process.
;session.gc_maxlifetime = 1440
session.gc_maxlifetime = 7776000

; Maximum size of POST data that PHP will accept.
; post_max_size = 8M
post_max_size = 200M

; Maximum allowed size for uploaded files.
; upload_max_filesize = 2M
upload_max_filesize = 200M
```

* in Apache configuration, expose the path to damas-core (either httpd.conf or virtual host or htaccess).

```
Alias /damas/server      "/path/to/damas-core/server-php/"
```

*  in a .htacess you can provide the Apache URL rewriting rules in order to access the server operations differently. The following rules are examples to provide the same access to operations as in the incoming server-nodejs version

```.htaccess
<IfModule mod_rewrite.c>
    RewriteEngine on
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    Rewriterule ^([0-9]+)$ model.crud.php?id=$1 [QSA,L]
    Rewriterule ^(.*)$ model.crud.php [QSA,L]
</IfModule>
```
Then make Apache reload your configuration files if needed and the REST server should be listening for incoming queries. According to your configuration, you can access it specifying its URL, such as http://server/damas/server/model.json.php. You can check that it is running using a web browser or curl command line utility.
