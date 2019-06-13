/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:55
 * @modify date 2019-06-13 15:42:55
 * @desc [description]
 */
import { Repository } from './repository/class'

// const repoInst = new Repository({
//     storage: {
//         type: 'postgres',
//         settings: {
//             host: 'localhost',
//             port: 5432,
//             database: 'sardines_test',
//             schema: 'test',
//             user: 'sardines',
//             password: 'Sardines2019'
//         }
//     }
// })

// repoInst.createOrUpdateService({
//     owner: 'sardines-test',
//     name: 'test',
//     version: '1.0.1',
//     source: 'not ready yet',
//     provider_settings: [{
//         provider: 'http',
//         driver: 'http',
//         settings: 'not ready yet'
//     }]
// }).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.error(err)
// }).finally(()=> {
//     repoInst.queryService({
//         owner: 'sardines-test',
//         name: 'test'
//     }).then((res) => {
//         console.log(res)
//     }).catch((err) => {
//         console.error(err)
//     })
// })
