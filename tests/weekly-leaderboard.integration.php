<?php
// Integration test: isolated MariaDB database only. Never point this at production.
require __DIR__.'/../loopia-server/lib.php';
$dsn=getenv('SS_TEST_DSN');$user=getenv('SS_TEST_USER');$password=getenv('SS_TEST_PASSWORD');
if(!$dsn||!str_contains($dsn,'dbname=ss_weekly_test;'))throw new RuntimeException('Use isolated ss_weekly_test database.');
$pdo=new PDO($dsn,$user,$password,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]);
if(($argv[1]??'')==='--worker'){$i=(int)$argv[2];storePersonalBest($pdo,'2026-W42','Concurrent',5000+$i*100,10+$i,hash('sha256','concurrent'));exit;}
function verify(bool $ok,string $label): void {if(!$ok)throw new RuntimeException($label);}
foreach(['ss_results','ss_challenges','ss_runs','ss_limits'] as $table)$pdo->exec('DROP TABLE IF EXISTS '.$table);
$schema=file_get_contents(__DIR__.'/../loopia-server/schema.sql');
$legacy=preg_replace('/^.*player_key.*\R/m','',$schema);$legacy=preg_replace('/^.*ss_player_week.*\R/m','',$legacy);
$pdo->exec($legacy);
$pdo->exec("INSERT INTO ss_results (challenge_id,name,score,length,created_at) VALUES ('2026-W42','Alva',1000,8,1),('2026-W42','alva',500,12,2)");
$upgrade=file_get_contents(__DIR__.'/../loopia-server/upgrade-player-id.sql');$pdo->exec($upgrade);$pdo->exec($upgrade);
$legacyRows=leaderboardEntries($pdo,'2026-W42','score',true);verify(count($legacyRows)===1&&$legacyRows[0]['score']===1000&&$legacyRows[0]['length']===12,'Legacy deduplication');
$key=hash('sha256','player-a');storePersonalBest($pdo,'2026-W42','SnakeA',2000,8,$key);storePersonalBest($pdo,'2026-W42','NewName',1500,22,$key);storePersonalBest($pdo,'2026-W42','NewName',100,4,$key);
$q=$pdo->prepare('SELECT name,score,length FROM ss_results WHERE player_key=? AND challenge_id=?');$q->execute([$key,'2026-W42']);$rows=$q->fetchAll(PDO::FETCH_ASSOC);verify(count($rows)===1&&$rows[0]['name']==='NewName'&&(int)$rows[0]['score']===2000&&(int)$rows[0]['length']===22,'Independent bests / lower scores / rename');
storePersonalBest($pdo,'2026-W43','SnakeA',100,5,$key);verify(count(leaderboardEntries($pdo,'2026-W43','score',true))===1,'Week isolation');
for($i=0;$i<60;$i++)storePersonalBest($pdo,'2026-W42','Player'.$i,3000+$i,10+$i,hash('sha256','player-'.$i));
$top=leaderboardEntries($pdo,'2026-W42','score',true);verify(count($top)===50&&$top[0]['score']===3059,'Top 50 sorting');verify(array_keys($top[0])===['name','score','length'],'No public IDs');
$processes=[];
for($i=0;$i<8;$i++){$pipes=[];$process=proc_open([PHP_BINARY,'-d','extension_dir='.ini_get('extension_dir'),'-d','extension=php_pdo_mysql.dll',__FILE__,'--worker',(string)$i],[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes);fclose($pipes[0]);$processes[]=[$process,$pipes];}
foreach($processes as [$process,$pipes]){$out=stream_get_contents($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);verify(proc_close($process)===0,'Concurrent worker '.$err);}
$q->execute([hash('sha256','concurrent'),'2026-W42']);$rows=$q->fetchAll(PDO::FETCH_ASSOC);verify(count($rows)===1&&(int)$rows[0]['score']===5700&&(int)$rows[0]['length']===17,'Concurrent atomic personal best');
echo "PASS: real MariaDB migration twice, legacy deduplication, independent bests, lower results, nickname change, week isolation, top 50, hidden IDs and eight concurrent submissions.\n";
