<?php
function settings(): array {return ['blocked_names'=>['TESTORD']];}
$source=file_get_contents(__DIR__.'/../loopia-server/lib.php');
$start=strpos($source,'function allowedName(');$end=strpos($source,'function rateLimit(',$start);
eval(substr($source,$start,$end-$start));
foreach(['Kuk','bajs','fitta','penis','snopp','röv','arsle','FUCK','shit','asshole','wanker','whore','bastard','snippa','h0r4','f1tta','kuuuuk','b4js','röööv','fuuuck','Sh1t','f.u.c.k','f u c k','SuperBajs','testord'] as $name)if(allowedName($name))throw new RuntimeException('Accepted: '.$name);
foreach(['Alva','Erik','Fanny','Hasse','SuperSnok','Snok42','Åsa','Örjan'] as $name)if(!allowedName($name))throw new RuntimeException('Rejected: '.$name);
echo "PASS: Swedish/English filter, variants, custom list and ordinary names.\n";
