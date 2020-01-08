#? /usr/bin/python3

import subprocess, sys, json, os
import argparse

argParser = argparse.ArgumentParser(description='create or config database')
argParser.add_argument('--env', type=str, required=False, help='env tag, such as dev, prod, test, ...')
argParser.add_argument('--database-settings-file', type=str, required=True, help='project settings file in JSON format')
args = argParser.parse_args()

db_settings_file = args.database_settings_file
env = args.env

def exec(cmd):
    print(cmd)
    os.system(cmd)

try:
    with open(db_settings_file) as f:
        database_settings = json.load(f)
    
    TYPE = database_settings["type"]
    USER = database_settings[["user"]
    PASSWORD = database_settings["password"]
    DATABASE = database_settings["database"]
    SCHEMA = database_settings["schema"]
    HOST = database_settings["host"]
    PORT = database_settings["port"]

    if TYPE == "postgres":
        process = subprocess.Popen('if [[ "`which psql`" == "" ]]; then echo "Executive psql not found"; exit 1; fi', shell=True, stdout=subprocess.PIPE)
        process.wait()
        if process.returncode == 1:
            sys.exit(1)

        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -c "CREATE DATABASE ' + DATABASE + ';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "CREATE USER ' + USER + ' WITH PASSWORD \'' + PASSWORD + '\';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "GRANT ALL PRIVILEGES ON DATABASE ' + DATABASE + ' TO ' + USER + ';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "CREATE EXTENSION IF NOT EXISTS \\\"uuid-ossp\\\";"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "CREATE SCHEMA IF NOT EXISTS ' + SCHEMA +';"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "GRANT USAGE ON SCHEMA ' + SCHEMA + ' TO ' + USER + ';"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "SELECT uuid_generate_v4();"')

except FileNotFoundError:
    print('Database settings file does not exist on the location: ' + db_settings_file)
except:
    print('unknown error')
