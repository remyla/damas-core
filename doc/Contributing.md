Contributing
============

# Table of Contents
* [Running Tests](#running-tests)
* [JS Code Conventions](#js-code-conventions)

# Running tests

* in `/server-tests/` - tests of the REST API using http://jasmine.github.io/
* the tests are to be run on code from the same development branch (master, testing or experimental)
* `/server-nodejs/tests` - tests for the nodejs server using mocha

## Installation
### Mocha

To get started, you need to install some modules in server-nodejs :
```
npm install mocha chai chai-as-promised supertest
```

Once mocha is started, every time you save modifications in a file the server is using, tests are made automatically

### Jasmine

To get started, you need to install some modules in server-tests :
```
npm install
```

Edit `conf-tests-frisby.json` as you need

## Run

To run tests, simply type the following command in the appropriate directory :

```
npm test
```

If you have this error :

```
/usr/bin/env: node: No such file or directory
```
then modify the shebang of the command (node_modules/{moduleName}/bin/{moduleName}) to `#!/usr/bin/env `**`nodejs`** or create an alias `node` -> `nodejs`

## Tests results

Fun fact : Mocha did a really strange thing : it changes `'Foo'` into `{Foo:''}` when it is sent in POST

Anyway, the priority is now given to Jasmine/Frisby.

The latter is now testing Create, Read, Update, Delete, Graph, Lock, Unlock.

It revealed that:
* Read and Graph returns a non empty array, the parameter is not found.
* Read in POST needs an object which contains the key `id` as parameter
* Lock and Unlock make server crash if parameter is not found
* Delete doesn't throw the right errors


# JS Code conventions

Abstract: as we start a new coding session with teammates we want to stick to a reference as explained in the issue [#99](../issues/99).

We mainly want to stick to the Crockford document. It will become our reference for this list:
* Variable Declaration
* indentation: 4 spaces
* 2 line return at the end of file

http://javascript.crockford.com/code.html

## Conditions

```js
if (null == variable) {
    return null;
} else if ('test' !== variable) {
    return false;
} else {
    // code...
}
```
1. When appliable, check the constant value before the variable.
It allows for more visibility in the code, and prevents unwanted assignments.

2. For multiple conditions, put the next one on the same line as the last closing bracket.

3. Use the strict equality check `===`, except when we want to test for equivalent values.

4. Always use braces and put the instructions on a new line. Even for single-line conditions containing a return statement.
This way we can insert new instructions within the same condition without modifying existing lines.

## Variables

```js
var i = 0;
var maximumValue = list.length;
i  = 1;
i += 2;
```

1. Always use the `var` keyword for each variable.

2. Don't vertically align operators, unless you do so for the same variable ; this way the lines are not dependent.
