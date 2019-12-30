/*
 * Created by Robin Sun
 * Created on 2019-12-27
 */
import * as fs from 'fs'
export const debugJson = (obj:any) => {
  if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) throw 'unsupported object for debug'
  for (let key of Object.keys(obj)) {
    fs.writeFileSync(`./debug-${key}.json`, JSON.stringify(obj[key],null,4))
  }
}

