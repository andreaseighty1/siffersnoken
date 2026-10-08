<?php
declare(strict_types=1);
function settings(): array {
    static $config;
    if (!$config) {
        // Keep credentials OUTSIDE the public web folder and Git repository.
        $path = dirname(__DIR__, 2) . '/siffersnoken-private/config.php';
        if (!is_file($path)) throw new RuntimeException('Servern är inte konfigurerad.');
        $config = require $path;
        if (strlen($config['secret'] ?? '') < 64 || str_contains($config['secret'], 'BYT_')) throw new RuntimeException('Konfigurera serverns hemlighet.');
    }
    return $config;
}
function db(): PDO {
    static $pdo;
    if (!$pdo) {$c=settings();$pdo=new PDO($c['dsn'],$c['user'],$c['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);}
    return $pdo;
}
function combinations(): array {
    $out=[];
    foreach ([10,20,50,100] as $range) foreach ([['+'],['-'],['+','-']] as $ops) $out[]=['ops'=>$ops,'range'=>$range,'tables'=>[]];
    foreach ([[2,5,10],[2,3,4,5],[6,7,8,9],[2,3,4,5,6,7,8,9,10]] as $tables) foreach ([['*'],['/'],['*','/']] as $ops) $out[]=['ops'=>$ops,'range'=>100,'tables'=>$tables];
    return $out;
}
function combinationKey(array $rules): string {return implode('', $rules['ops']).':'.$rules['range'].':'.implode(',', $rules['tables']);}
function chooseRules(?string $previous): array {
    $choices=array_values(array_filter(combinations(),fn($r)=>combinationKey($r)!==$previous));
    return $choices[random_int(0,count($choices)-1)];
}
function period(?DateTimeImmutable $date=null): array {
    $date=$date??new DateTimeImmutable('now',new DateTimeZone('Europe/Stockholm'));
    $start=$date->setISODate((int)$date->format('o'),(int)$date->format('W'),1)->setTime(0,0);
    return ['id'=>$start->format('o-\WW'),'year'=>(int)$start->format('o'),'week'=>(int)$start->format('W'),'start'=>$start->getTimestamp(),'end'=>$start->modify('+1 week')->getTimestamp(),'previous'=>$start->modify('-1 week')->format('o-\WW')];
}
function publicChallenge(array $row): array {return ['id'=>$row['id'],'year'=>(int)$row['iso_year'],'week'=>(int)$row['iso_week'],'startsAt'=>(int)$row['starts_at'],'endsAt'=>(int)$row['ends_at'],'rules'=>json_decode($row['rules_json'],true,512,JSON_THROW_ON_ERROR)];}
function currentChallenge(): array {
    $pdo=db();$p=period();$lock='ss_weekly_rotation';
    if ((int)$pdo->query("SELECT GET_LOCK('$lock', 5)")->fetchColumn()!==1) throw new RuntimeException('Försök igen om en stund.');
    try {
        $q=$pdo->prepare('SELECT * FROM ss_challenges WHERE id=?');$q->execute([$p['id']]);$row=$q->fetch();if($row)return publicChallenge($row);
        $q->execute([$p['previous']]);$previous=$q->fetch();
        $rules=chooseRules($previous ? $previous['combination'] : null);
        $insert=$pdo->prepare('INSERT INTO ss_challenges (id,iso_year,iso_week,combination,rules_json,starts_at,ends_at) VALUES (?,?,?,?,?,?,?)');
        $insert->execute([$p['id'],$p['year'],$p['week'],combinationKey($rules),json_encode($rules,JSON_THROW_ON_ERROR),$p['start'],$p['end']]);
        $q->execute([$p['id']]);return publicChallenge($q->fetch());
    } finally {$pdo->query("SELECT RELEASE_LOCK('$lock')");}
}
function allowedName(string $name): bool {
    if (!preg_match('/\A[A-Za-zÅÄÖåäö0-9]{3,12}\z/u',$name))return false;
    $normalized=strtolower(strtr($name,['Å'=>'a','Ä'=>'a','Ö'=>'o','å'=>'a','ä'=>'a','ö'=>'o','0'=>'o','1'=>'i','3'=>'e','4'=>'a','5'=>'s','7'=>'t']));
    $short=preg_replace('/(.)\1+/','$1',$normalized);
    $words=['fuck','shit','bitch','cunt','hora','horunge','kuk','fitta','knulla','jävel','javel','jävla','javla','helvete','nigger','neger','nazist','hitler'];
    foreach(array_merge($words,settings()['blocked_names']??[]) as $word) {if(str_contains($normalized,$word)||str_contains($short,preg_replace('/(.)\1+/','$1',$word)))return false;}
    return !in_array($normalized,['fan','faan'],true);
}
function rateLimit(string $action,int $max): void {
    // Rotating HMAC of IP, retained for <= 1 hour; never stored with scores.
    $slot=(int)floor(time()/3600);$key=hash_hmac('sha256',($action.':'.$slot.':'.($_SERVER['REMOTE_ADDR']??'')),settings()['secret']);
    $pdo=db();$q=$pdo->prepare('INSERT INTO ss_limits (bucket,hits,expires_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE hits=hits+1');$q->execute([$key,($slot+1)*3600]);
    $q=$pdo->prepare('SELECT hits FROM ss_limits WHERE bucket=?');$q->execute([$key]);if((int)$q->fetchColumn()>$max)throw new DomainException('För många försök. Försök senare.');
    $pdo->exec('DELETE FROM ss_limits WHERE expires_at < '.time());$pdo->exec('DELETE FROM ss_runs WHERE expires_at < '.time());
}
