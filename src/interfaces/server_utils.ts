/*
 * Created by Robin Sun
 * Created on 2019-12-27
 */
import * as fs from 'fs'

export const debugJson = (obj:any) => {
  if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) {
    throw `[ServerUtils][debugJson] unsupported object type[${typeof obj}] for debug`
  }
  for (let key of Object.keys(obj)) {
    const filepath = `./debug-${key}.json`
    console.log(`[ServerUtils][debugJson] dumping object <${typeof obj[key]}>${key} at ${filepath}`)
    fs.writeFileSync(filepath, JSON.stringify(obj[key],null,4))
  }
}

