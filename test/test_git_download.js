
const url = 'git@github.com:robin98sun/dietitian.js.git'
const tag = 'v0.'
const gitRootDir = './test_sardines_git_root'
const projName = 'dietitian'
const git = require('simple-git/promise')

git(gitRootDir).clone(url)
