#? /usr/local/bin/python3

import subprocess, sys, json, os
process = subprocess.Popen('if [[ "`which psql`" == "" ]]; then echo "Executive psql not found"; exit 1; fi', shell=True, stdout=subprocess.PIPE)
process.wait()
if process.returncode == 1:
    sys.exit(1)

env = 'dev'
if len(sys.argv) > 1:
    env = sys.argv[1]
running_dir = os.path.dirname(os.path.realpath(__file__))
proj_settings_file = running_dir + '/proj-settings.'+env+'.json'

def exec(cmd):
    print(cmd)
    os.system(cmd)

try:
    with open(proj_settings_file) as f:
        project_settings = json.load(f)
    
    TYPE = project_settings["storage"]["type"]
    USER = project_settings["storage"]["settings"]["user"]
    PASSWORD = project_settings["storage"]["settings"]["password"]
    DATABASE = project_settings["storage"]["settings"]["database"]
    SCHEMA = project_settings["storage"]["settings"]["schema"]
    HOST = project_settings["storage"]["settings"]["host"]
    PORT = project_settings["storage"]["settings"]["port"]

    if TYPE == "postgres":
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -c "CREATE DATABASE ' + DATABASE + ';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "CREATE USER ' + USER + ' WITH PASSWORD \'' + PASSWORD + '\';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "GRANT ALL PRIVILEGES ON DATABASE ' + DATABASE + ' TO ' + USER + ';"')
        exec('psql -h ' + HOST + ' -p ' + str(PORT) + ' -d ' + DATABASE + ' -c "CREATE EXTENSION IF NOT EXISTS \\\"uuid-ossp\\\";"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "CREATE SCHEMA IF NOT EXISTS ' + SCHEMA +';"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "GRANT USAGE ON SCHEMA ' + SCHEMA + ' TO ' + USER + ';"')
        exec('PGPASSWORD=' + PASSWORD + ' psql -h ' + HOST + ' -p ' + str(PORT) + ' -U ' + USER + ' -d ' + DATABASE + ' -c "SELECT uuid_generate_v4();"')

except FileNotFoundError:
    print('project settings file does not exist on the location: ' + proj_settings_file)
except:
    print('unknown error')
