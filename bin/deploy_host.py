#!/usr/bin/env python3
import sys
import os
import argparse
import json

cwd = os.getcwd()
argParser = argparse.ArgumentParser(description='Deploy the sardines shoal agent on a remote host via ssh')
argParser.add_argument('--host-name', type=str, required=True, help='Remote host name')
argParser.add_argument('--os-user', type=str, default='sardines', help='OS user on the remote host')
argParser.add_argument('--ipv4', type=str, required=False, help='IPv4 address of the remote host')
argParser.add_argument('--port', type=int, required=False, help='SSH port of the remote host')
argParser.add_argument('--ipv6', type=str, required=False, help='IPv6 address of the remote host')
argParser.add_argument('--node-bin', type=str, required=False, default='./bin/node-v12.8.0-linux-x64.tar.xz', help='Node binary package to be copied to remote host')
argParser.add_argument('--shoal-pkg', type=str, required=False, default=cwd, help='Sardines shoal source package location')
argParser.add_argument('--repo-deploy-file', type=str, required=True, help='The sardines repository used to manage the resource')

args = argParser.parse_args()
target_addr = args.host_name
if not target_addr:
  target_addr = args.ipv4
if not target_addr:
  target_addr = args.ipv6

if not target_addr: 
  print('invalid target host')
  sys.exit(1)

os_user = args.os_user
node_bin = args.node_bin

def ssh_exec(cmd, work_dir = '~', env = None):
  ssh_cmd = 'ssh'
  if args.port:
    ssh_cmd += ' -p ' + args.port
  remote_cmd = ''
  if work_dir != '~':
    remote_cmd = 'cd ' + work_dir + '; '
  remote_path = '/usr/local/bin:/usr/bin:/bin:$HOME/bin'
  if env == 'node':
    remote_cmd += 'export PATH='+ remote_path +':~/node/bin:./node_modules/.bin; '
  remote_cmd += cmd

  ssh_cmd += ' ' + os_user + '@' + target_addr + ' "' + remote_cmd + '"'
  print(ssh_cmd)
  cmd_exit_code = os.system(ssh_cmd)
  if cmd_exit_code != 0:
    print('error when executing ssh command, error code:' + str(cmd_exit_code))
    sys.exit(cmd_exit_code)

def scp(filepath, remote_file_path):
  cmd = 'scp -r'
  if args.port:
    cmd += ' -P ' + args.port
  cmd += ' ' + filepath + ' ' + os_user + '@' + target_addr + ':~/' + remote_file_path
  print(cmd)
  cmd_exit_code = os.system(cmd)
  if cmd_exit_code != 0:
    print('error when copying file to remote host, error code:' + str(cmd_exit_code))
    sys.exit(cmd_exit_code)

# Copy node binary to the remote host (Linux)
ssh_exec('rm -rf node*')
scp(node_bin, 'node.tar.xz')
ssh_exec('tar -xf node.tar.xz && rm -f node.tar.xz && if [ ! -d node ];then mv node* node; fi')


# Copy this sardines.shoal to the remote host
remote_work_dir = 'sardines.shoal'
ssh_exec('rm -rf ' + remote_work_dir + ' && mkdir -p ' + remote_work_dir)

for f in ['src', 'package.json', 'conf']:
  scp(args.shoal_pkg + '/' + f, remote_work_dir + '/' + f)

# Build sardines.shoal on remote host
ssh_exec('npm i && npm run build', work_dir=remote_work_dir, env='node')

