# DAMAS Server - PHP / MySQL


## Packages dependencies for GNU/Debian
* apache2      (required)
* php5         (required)
* mysql-server (required)
* php5-mysql   (required)
* phpmyadmin   (optional)
* cifs-utils # to mount files from a Microsoft server

## Setup damas-core

### Get damas-core

clone the damas-core repository using git:

	$ git clone https://github.com/remyla/damas-core.git

### MySQL database

Create a database:

	> CREATE DATABASE damasdb;

Import the empty database:

	$ mysql damasdb < damas_init.sql

### Apache web server

Specify the path to damas-core in your Apache configuration file:

	Alias /damas/server      "/path/to/damas-core/server-php/"

### Setup Damas
Rename the file settings_install.php to settings.php in the server directory or copy it tothe /etc/damas directory. Follow the instructions inside the file.

### Customize php.ini
* Sessions timeout (90 days):

	; After this number of seconds, stored data will be seen as 'garbage' and
	; cleaned up by the garbage collection process.
	;session.gc_maxlifetime = 1440
	session.gc_maxlifetime = 7776000

* Post size:

	; Maximum size of POST data that PHP will accept.
	;post_max_size = 8M
	post_max_size = 200M

* File size:

	; Maximum allowed size for uploaded files.
	;upload_max_filesize = 2M
	upload_max_filesize = 200M


