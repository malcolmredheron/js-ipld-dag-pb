const dagPB = require('../src')

const obj = {
  data: '{"Luck":0.4,"Proof":"<TEE signature>"}',
  links: [{
    multihash: 'QmUxD5gZfKzm8UN4WaguAMAZjw2TzZ2ZUmcqm2qXPtais7',
    name: 'payload',
    size: 819
  }]
}

dagPB.DAGNode.create(obj.data, obj.links, 'sha2-256', (err, dagNode) => {
  if (err) {
    throw err
  }
  console.log('create', dagNode.toJSON())
})

dagPB.util.serialize(obj, (err, serialized) => {
  if (err) {
    throw err
  }
  dagPB.util.deserialize(serialized, (err, dagNode) => {
    if (err) {
      throw err
    }
    console.log(dagNode.toJSON())
  })
})
