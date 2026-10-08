<?php
declare(strict_types=1);
require __DIR__.'/lib.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
function respond(array $value,int $code=200): never {http_response_code($code);echo json_encode($value,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;}
try {
    $config=settings();$origin=$_SERVER['HTTP_ORIGIN']??'';
    if($origin && $origin!==$config['origin'])respond(['error'=>'Otillåten webbplats.'],403);
    if($origin){header('Access-Control-Allow-Origin: '.$config['origin']);header('Vary: Origin');}
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');header('Access-Control-Allow-Headers: Content-Type');
    if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code(204);exit;}
    $action=$_GET['action']??'challenge';$post=in_array($action,['start','submit'],true);
    if($_SERVER['REQUEST_METHOD']!==($post?'POST':'GET'))respond(['error'=>'Fel anropsmetod.'],405);
    if($post){if((int)($_SERVER['CONTENT_LENGTH']??0)>4096)respond(['error'=>'För stort anrop.'],413);$raw=file_get_contents('php://input',false,null,0,4097);if(strlen($raw)>4096)respond(['error'=>'För stort anrop.'],413);$input=json_decode($raw,true,16,JSON_THROW_ON_ERROR);if(!is_array($input))respond(['error'=>'Felaktigt anrop.'],400);}
    if($action==='challenge'){$challenge=currentChallenge();$challenge['identityVersion']=identityStorageReady()?1:0;respond($challenge);}
    if($action==='leaderboard'){
        $id=$_GET['week']??currentChallenge()['id'];if(!preg_match('/\A\d{4}-W\d{2}\z/',$id))respond(['error'=>'Ogiltig vecka.'],400);
        $ready=identityStorageReady();respond(['scores'=>leaderboardEntries(db(),$id,'score',$ready),'lengths'=>leaderboardEntries(db(),$id,'length',$ready),'identityVersion'=>$ready?1:0]);
    }
    if($action==='start'){
        rateLimit('start',240);$challenge=currentChallenge();$token=bin2hex(random_bytes(32));$q=db()->prepare('INSERT INTO ss_runs (token_hash,challenge_id,started_at,expires_at) VALUES (?,?,?,?)');$q->execute([hash('sha256',$token),$challenge['id'],time(),min(time()+14400,$challenge['endsAt']+3600)]);respond(['challenge'=>$challenge,'token'=>$token]);
    }
    if($action==='submit'){
        rateLimit('submit',120);$name=$input['name']??'';if(!is_string($name)||!allowedName($name))respond(['error'=>'Välj ett annat namn: 3–12 bokstäver/siffror och inga olämpliga ord.'],400);
        foreach(['score','length','correct','total'] as $field)if(!isset($input[$field])||!is_int($input[$field]))respond(['error'=>'Felaktigt resultat.'],400);
        if($input['score']<0||$input['score']>10000000||$input['length']<4||$input['length']>336||$input['correct']<0||$input['total']<$input['correct']||$input['total']>100000||$input['length']>4+3*$input['correct'])respond(['error'=>'Resultatet är inte giltigt.'],400);
        $token=$input['token']??'';if(!is_string($token)||!preg_match('/\A[a-f0-9]{64}\z/',$token))respond(['error'=>'Ogiltig spelomgång.'],400);
        $playerId=$input['playerId']??'';
        if(!is_string($playerId)||!preg_match('/\A[a-f0-9]{64}\z/',$playerId))respond(['error'=>'Ladda om webbappen och starta en ny omgång för att publicera.'],400);
        if(!identityStorageReady())respond(['error'=>'Topplistan uppdateras. Försök igen när uppdateringen är klar.'],503);
        $playerKey=hash_hmac('sha256',$playerId,$config['secret']);
        $pdo=db();$pdo->beginTransaction();$q=$pdo->prepare('SELECT * FROM ss_runs WHERE token_hash=? FOR UPDATE');$q->execute([hash('sha256',$token)]);$run=$q->fetch();
        if(!$run||$run['used']||$run['expires_at']<time()){ $pdo->rollBack();respond(['error'=>'Omgången är redan publicerad eller har gått ut.'],409);}
        if($input['total']>max(1,(time()-(int)$run['started_at'])*5)){ $pdo->rollBack();respond(['error'=>'Resultatet är inte rimligt för speltiden.'],400);}
        storePersonalBest($pdo,$run['challenge_id'],$name,$input['score'],$input['length'],$playerKey);$q=$pdo->prepare('UPDATE ss_runs SET used=1 WHERE token_hash=?');$q->execute([hash('sha256',$token)]);$pdo->commit();respond(['ok'=>true]);
    }
    respond(['error'=>'Okänt anrop.'],404);
}catch(DomainException $e){respond(['error'=>$e->getMessage()],429);}catch(JsonException $e){respond(['error'=>'Felaktigt anrop.'],400);}catch(Throwable $e){if(isset($pdo)&&$pdo->inTransaction())$pdo->rollBack();error_log('SifferSnoken service error: '.get_class($e));respond(['error'=>'Topplistan är tillfälligt otillgänglig.'],503);}
