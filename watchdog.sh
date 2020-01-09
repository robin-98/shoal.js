WORKSPACE=sardines.shoal
if [ `ps -ef|grep 'node lib/index.js ./sardines-services-agent.json ./deploy-agent.json'|
        grep -v grep|grep -v 'bash -c'|grep -v 'sh -c'|
        wc -l|awk '{print $1}'` -eq 0 ];then 
  cd $WORKSPACE
  export PATH=$PATH:$HOME/node/bin:./node_modules/.bin
  which node
  which npm
  nohup npm run startAgent >> agent.log 2>&1 &
  echo "sardines restarted at" `date`
else
  echo "sardines is in memory at" `date`
fi
    