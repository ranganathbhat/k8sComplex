const keys = require('./keys');
const redis = require('redis');

const redisCli = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: ()=>1000,
  // if redis connection lost, then retry after 1000ms
});
const sub = redisCli.duplicate();

function fib(i){
  return (i<2) ? 1 : fib(i-1)+fib(i-2);
}

sub.on('message', (channel, msg)=>{
  redisCli.hset('values', msg, fib(parseInt(msg)));
});
sub.subscribe('insert');
