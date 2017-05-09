'use strict'

// This file is a copy of create.js that has been tweaked to call `callback` synchronously. In order to minimize the
// changes it retains the form and API of the async version, though.

const multihashing = require('multihashing-async')
const sort = require('stable')
const dagPBUtil = require('../util.js')
const serialize = dagPBUtil.serialize
const dagNodeUtil = require('./util.js')
const linkSort = dagNodeUtil.linkSort
const DAGNode = require('./index.js')
const DAGLink = require('./../dag-link')
var createHash = require('sha.js')

function createSync (data, dagLinks, hashAlg, callback) {
  if (typeof data === 'function') {
    callback = data
    data = undefined
  } else if (typeof data === 'string') {
    data = new Buffer(data)
  }
  if (typeof dagLinks === 'function') {
    callback = dagLinks
    dagLinks = []
  }
  if (typeof hashAlg === 'function') {
    callback = hashAlg
    hashAlg = undefined
  }

  if (!Buffer.isBuffer(data)) {
    return callback('Passed \'data\' is not a buffer or a string!')
  }

  if (!hashAlg) {
    hashAlg = 'sha2-256'
  }

  const links = dagLinks.map((l) => {
    if (l.constructor && l.constructor.name === 'DAGLink') {
      return l
    }

    return new DAGLink(
      l.name ? l.name : l.Name,
      l.size ? l.size : l.Size,
      l.hash || l.Hash || l.multihash
    )
  })
  const sortedLinks = sort(links, linkSort)

  serialize({
    data: data,
    links: sortedLinks
  }, (err, serialized) => {
    if (err) {
      return callback(err)
    }

    // TODO: handle and report exceptions from here.
    let sha256Builder = createHash('sha256')
    const digest = Buffer.from(sha256Builder.update(serialized).digest('hex'), 'hex')
    const multihash = multihashing.multihash.encode(digest, 'sha2-256')

    const dagNode = new DAGNode(data, sortedLinks, serialized, multihash)
    callback(null, dagNode)
  })
}

module.exports = createSync
