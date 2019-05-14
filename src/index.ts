import { Repository } from './repository'

const repoInst = new Repository({
    host: 'localhost',
    port: 5432,
    database: 'sardines_test',
    schema: 'test',
    user: 'sardines',
    password: 'Sardines2019'
})

// repoInst.registerService({
//     owner: 'sardines-test',
//     name: 'test',
//     version: '1.0.1',
//     source: 'not ready yet',
//     provider_settings: [{
//         provider: 'http',
//         driver: 'http',
//         settings: 'not ready yet'
//     }]
// })

repoInst.queryService({
    owner: 'sardines-test',
    name: 'test'
}).then((res) => {
    console.log(res)
}).catch((err) => {
    console.log(err)
})