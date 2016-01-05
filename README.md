# solid.js
[![](https://img.shields.io/badge/project-Solid-7C4DFF.svg?style=flat-square)](https://github.com/solid/solid)

Javascript library for Solid applications

# Dependencies
This library currently depends on [rdflib.js](https://github.com/linkeddata/rdflib.js/). Please make sure to load the `rdflib.js` script **before** loading `solid.js`.

# Web operations

Here are some useful examples of functions you can implement in your own app, in order to manipulate resources using LDP-friendly calls. Just make sure you include the `solid.js` script in your HTML page.

## Creating a container (folder)
Creating an LDP container is quite trivial. The `Solid.web.post` function accepts the following parameters:

* `parentDir` (string) - the URL of the parent container in which the new resource will be created
* `slug` (string) - the value for the `Slug` header -- i.e. the name of the new resource to be created
* `metaData` (string) - RDF data serialized as `text/turtle`; can also be an empty string is no data needs to be sent
* `isContainer` (boolean) (optional) - whether the new resource should be an LDP container or a regular LDP resource; defaults to LDP resource if the value is not present

Here is a full example where we try to create a container called `blog` under `https://example.org/`. We are also sending some meta data about the container, setting its type to `sioc:Blog`. 

```javascript
var parentDir = 'https://example.org/';
var slug = 'blog';
var metaData = '<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Blog> .';
var isContainer = true;

Solid.web.post(parentDir, slug, metaData, isContainer).then(
    function(meta) {
        console.log(meta);
        // The resulting object has several useful properties:
        // meta.url - Location header value
        // meta.acl - url of acl resource
        // meta.meta - url of meta resource
    }
).catch(function(err){
    console.log(err); // error object
    console.log(err.status); // contains the error status
    console.log(err.xhr); // contains the xhr object
});
```

## Creating a resource
Creating regular LDP resources is very similar to creating containers, except for the `isContainer` value, which is no longer set.

Here is an example where we try to create the resource `hello-world` under `https://example.org/blog/`. This will be an empty resource for now. 

```javascript
var parentDir = 'https://example.org/blog/';
var slug = 'hello-world';
var metaData = '';

Solid.web.post(parentDir, slug, metaData).then(
    function(meta) {
        console.log(meta);
        console.log(meta.xhr.status); // HTTP 201 (created)
        console.log(meta.url); // URL of the newly created resource
    }
).catch(function(err){
    console.log(err); // error object
    ...
});
```

## Overwriting a resource
You can also overwrite existing resources with new content, using the `Solid.web.put` function.

Here is an example where we try to overwrite the resource `hello-world` by sending some meta data about the resource, setting its type to `sioc:Post`. 


```javascript
var url = 'https://example.org/blog/hello-world';
var metaData = '<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/sioc/ns#Post> .';
Solid.web.put(url, metaData).then(
    function(meta) {
        console.log(meta);
        console.log(meta.xhr.status); // HTTP 200 (OK)
    }
).catch(function(err){
    console.log(err); // error object
    ...
});
```

## Reading a resource
Reading an RDF resource from the Web is done using the `Solid.web.get` function.

```javascript
var url = 'https://example.org/blog/hello-world';

Solid.web.get(url).then(
    function(g) {
        // Print all statements matching resources of type foaf:Post
        console.log(g.statementsMatching(undefined, RDF('type'), SIOC('Post')));
    }
).catch(
    function(err) {
        console.log(err); // error object
        ...
    }
);
```

## Getting some information on a resource
Sometimes an application may need to get some useful meta data about a resource. For instance, it may want to find out where the ACL resource is. Clients should take notice to the fact that the `Solid.web.head` function will always successfully complete, even for resources that don't exists, since that is considered useful information. For instance, clients can use the `meta.xhr.status` value to see whether a resource exists or not.

Here, for example, we can find out where the corresponding ACL resource is for our new blog post `hello-world`.

```javascript
var url = 'https://example.org/blog/hello-world';

Solid.web.head(url).then(
    function(meta) {
        console.log(meta.acl); // the ACL uri
        if (meta.xhr.status === 403) {
            console.log("You don't have access to the resource");
        }
    }
);
```

## Deleting a resource
Delete an RDF resource from the Web. For example, we can use the function `Solid.web.delete` to delete the blog post `hello-world` we created earlier.

```javascript
var url = 'https://example.org/blog/hello-world';

Solid.web.del(url).then(
    function(success) {
        console.log(success); // true/false
    }
).catch(
    function(err) {
        console.log(err); // error object
        ...
    }
);
```

# Authentication

## Login
Authenticating a user and returning their WebID.

```javascript
var login = function() {
    // Get the current user
    Solid.auth.login().then(function(webid){
    	// authentication succeeded; do something with the WebID string
        console.log(webid);
    }).catch(function(err) {
        // authentication failed; display some error message
        console.log(err);
    });
};
```

## Signup
Signing a user up for a WebID account and storage, and then returning their WebID. If the opreation is successful and a WebID is returned, then the user can also be considered to be authenticated.

```javascript
// Signup for a WebID
var signup = function() {
    Solid.auth.signup().then(function(webid) {
    	// authentication succeeded; do something with the WebID string
        console.log(webid);
    }).catch(function(err) {
        // authentication failed; display some error message
        console.log(err);
    });
};
```
