'use strict'

var test = require('tape')
var typeRegistry = require('../../lib/type-registry')
var parseGraph = require('../../lib/util/graph-util').parseGraph
var SolidProfile = require('../../lib/solid/profile')
var vocab = require('../../lib/vocab')
// var rdf = require('../../lib/util/rdf-parser').rdflib

var rawProfileSource = require('../resources/profile-ldnode')
var sampleProfileUrl = 'https://localhost:8443/profile/card'
var parsedProfileGraph = parseGraph(sampleProfileUrl,
  rawProfileSource, 'text/turtle')

test('Solid.typeRegistry isListedTypeIndex test', function (t) {
  var url = 'https://localhost:8443/settings/publicTypeIndex.ttl'
  var rawIndexSource = require('../resources/type-index-listed')
  var graph = parseGraph(url, rawIndexSource, 'text/turtle')
  var result = typeRegistry.isListedTypeIndex(graph)
  t.ok(result)
  t.end()
})

test('Solid.typeRegistry isUnlistedTypeIndex test', function (t) {
  var url = 'https://localhost:8443/settings/privateTypeIndex.ttl'
  var rawIndexSource = require('../resources/type-index-unlisted')
  var graph = parseGraph(url, rawIndexSource, 'text/turtle')
  var result = typeRegistry.isUnlistedTypeIndex(graph)
  t.ok(result)
  t.end()
})

test('registerType - throws error for invalid arguments', function (t) {
  let profile = new SolidProfile()  // not loaded
  t.throws(function () {
    typeRegistry.registerType(profile)
  }, 'Registering a type without loading a profile throws an error')
  t.end()
})

test('SolidProfile addTypeRegistry() test', function (t) {
  let urlListed = 'https://localhost:8443/settings/publicTypeIndex.ttl'
  let rawIndexSourceListed = require('../resources/type-index-listed')
  let graphListedIndex = parseGraph(urlListed, rawIndexSourceListed,
      'text/turtle')

  let urlUnlisted = 'https://localhost:8443/settings/privateTypeIndex.ttl'
  let rawIndexSourceUnlisted = require('../resources/type-index-unlisted')
  let graphUnlistedIndex = parseGraph(urlUnlisted, rawIndexSourceUnlisted,
    'text/turtle')

  let profile = new SolidProfile(sampleProfileUrl, parsedProfileGraph)

  profile.addTypeRegistry(graphListedIndex)
  profile.addTypeRegistry(graphUnlistedIndex)

  // Look up the address book (loaded from public registry)
  var result =
    profile.typeRegistryForClass(vocab.vcard('AddressBook'))
  t.deepEqual(result.unlisted, [])  // no unlisted registry matches
  t.equal(result.listed.length, 1)  // one listed registry match

  // Look up the SIOC posts (loaded from the unlisted registry)
  result =
    profile.typeRegistryForClass(vocab.sioc('Post'))
  t.deepEqual(result.listed, [])  // no listed registry matches
  t.equal(result.unlisted.length, 1)  // one unlisted registry match
  t.end()
})
