<img src="http://damas-software.com/bin/damas_logo.png" alt="damas-core"/>

http://damas-software.org

# damas-core/server-php

* RESTful HTTP stateless server written in Php
* Key-value data model and directed graph for MySQL

## Installation

GNU/Debian packages:

php5 php5-mysql mysql-server apache2

1. retrieve damas-core using git:

	$ git clone https://github.com/remyla/damas-core.git

2. in MySQL, create a database:

	&gt; CREATE DATABASE damasdb;

⋅⋅⋅and import the table structure: 

	$ mysql damasdb < damas_init.sql

3. in Apache, expose the path to damas-core (either httpd.conf or virtual host)

	Alias /damas/server      "/path/to/damas-core/server-php/"

4. rename settings_install.php to settings.php and edit it to match your configuration

5. customize Php to match your needs (in php.ini):
* Increase the duration of sessions to 90 before timeout:

        ; After this number of seconds, stored data will be seen as 'garbage' and
        ; cleaned up by the garbage collection process.
        ;session.gc_maxlifetime = 1440
        session.gc_maxlifetime = 7776000

* Increase the maximum post size:

        ; Maximum size of POST data that PHP will accept.
        ;post_max_size = 8M
        post_max_size = 200M

* Increase the maximum file size allowed:

        ; Maximum allowed size for uploaded files.
        ;upload_max_filesize = 2M
        upload_max_filesize = 200M
