// Load modules

var NodeUtil = require('util');
var Expat = require('node-expat');


// Declare internals

var internals = {};


exports.createParser = function (callback) {

    // State variables

    var result = {};            // Final result object
    var node = result;          // Current node
    var text = '';              // Current text value
    var attrs = null;           // Current attributes
    var tree = [];              // Array of parents to current node
    var errorMessage = null;           // Last errorMessage found

    // Create parser instance

    var parser = new Expat.Parser('UTF-8');

    parser.on('startElement', function (name, attributes) {

        if (Object.keys(attributes).length) {
            attrs = attributes;
        }

        text = internals.cleanText(text);
        if (text) {
            errorMessage = 'Element contains mixture of text (' + text + ') and child (' + name + ') combination';
            text = '';          // Flush out text
        }

        // Check if within an array

        if (node instanceof Array) {
            tree.push(node);
            var child = {};
            node.push(child);
            tree.push(child);
            child[name] = {};
            node = child[name];
        }
        else {

            // Check for existing node with same name

            if (node[name]) {
                if (node[name] instanceof Array === false) {

                    // Convert to array

                    var value = node[name];
                    node[name] = [value];
                }
            }
            else {
                node[name] = {};
            }

            tree.push(node);
            node = node[name];
        }
    });

    parser.on('endElement', function (name) {

        var value;

        node = tree.pop();              // Return to parent

        text = internals.cleanText(text);
        if (text) {
            if (attrs) {
                value = attrs;
                value['$text'] = text;
            } else {
                value = text;
            }

            if (node[name] instanceof Array) {
                node[name].push(value);
            }
            else {
                node[name] = value;
            }

            text = '';
        }
        else {
            value = attrs || '';

            if (node instanceof Array) {
                node = tree.pop();      // Return to parent
            }
            else if (Object.keys(node[name]).length === 0) {
                node[name] = value;        // Set empty node to empty string
            }
        }

        attrs = null;
    });

    parser.on('text', function (s) {

        if (s) {
            text += s;
        }
    });

    parser.on('end', function () {

        parser.removeAllListeners();
        var message = errorMessage || parser.getError();
        if (message) {
            var error = new Error(message);
            error.result = result;
            return callback(error);
        }

        return callback(null, result);
    });

    // parser.on('startCdata', function () {});
    // parser.on('endCdata', function () {});

    return parser;
};


internals.cleanText = function (text) {

    return text.replace(/(^\s+|\s+$)/g, '');
};
