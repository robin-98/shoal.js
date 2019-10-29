
const url = 'git@github.com:robin98sun/dietitian.js.git'
const version = '0.0.30'
const gitRootDir = './test_sardines_git_root'
const projName = 'dietitian'
const git = require('simple-git/promise')

const fs = require('fs')
if (!fs.existsSync(gitRootDir)) {
  fs.mkdirSync(gitRootDir)
}
git(gitRootDir).clone(url).then(()=> {
      console.log('done')
  // git(`${gitRootDir}/dietitian.js`).fetch(url, options={'--tags': true}).then(() => {
    // git(`${gitRootDir}/dietitian.js`).checkout(`sardines-v${version}`).then(()=> {
    // })
  // })
})
