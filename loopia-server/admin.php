<?php
declare(strict_types=1);
require __DIR__.'/lib.php';
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");
ini_set('session.use_strict_mode','1');session_set_cookie_params(['secure'=>true,'httponly'=>true,'samesite'=>'Strict']);session_start();
function h(string $s): string {return htmlspecialchars($s,ENT_QUOTES,'UTF-8');}
$message='';
try {
    $_SESSION['csrf']??=bin2hex(random_bytes(32));
    if($_SERVER['REQUEST_METHOD']==='POST'){
        if(!hash_equals($_SESSION['csrf'],$_POST['csrf']??''))throw new RuntimeException('Ladda om sidan och försök igen.');
        if(isset($_POST['password'])){rateLimit('admin',15);if(password_verify($_POST['password'],settings()['admin_hash'])){session_regenerate_id(true);$_SESSION['admin_until']=time()+1800;}else $message='Fel lösenord.';}
        elseif(($_SESSION['admin_until']??0)>time()&&isset($_POST['delete'])){$q=db()->prepare('DELETE FROM ss_results WHERE id=?');$q->execute([(int)$_POST['delete']]);$message='Resultatet borttaget.';}
        elseif(isset($_POST['logout'])){$_SESSION=[];session_destroy();header('Location: admin.php');exit;}
    }
    $admin=($_SESSION['admin_until']??0)>time();$rows=$admin?db()->query('SELECT * FROM ss_results ORDER BY id DESC LIMIT 200')->fetchAll():[];
}catch(Throwable $e){$admin=false;$rows=[];$message='Kontrollera serverkonfigurationen eller försök igen.';}
?>
<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SifferSnoken – administration</title><style>body{font:16px system-ui;max-width:900px;margin:30px auto;padding:16px;background:#f3f8f3;color:#153923}button,input{padding:10px;margin:4px}table{width:100%;border-collapse:collapse}td,th{padding:8px;text-align:left;border-bottom:1px solid #ccc}</style><h1>SifferSnokens topplistor</h1><p><?=h($message)?></p>
<?php if(!$admin): ?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><label>Administratörslösenord <input type="password" name="password" required autocomplete="current-password"></label><button>Logga in</button></form>
<?php else: ?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><button name="logout">Logga ut</button></form><p>Senaste 200 resultat. Lägg till blockerade namn i den privata konfigurationens blocked_names.</p><table><tr><th>Vecka</th><th>Namn</th><th>Poäng</th><th>Längd</th><th></th></tr><?php foreach($rows as $row): ?><tr><td><?=h($row['challenge_id'])?></td><td><?=h($row['name'])?></td><td><?=(int)$row['score']?></td><td><?=(int)$row['length']?></td><td><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><button name="delete" value="<?=(int)$row['id']?>">Ta bort</button></form></td></tr><?php endforeach ?></table><?php endif ?></html>
