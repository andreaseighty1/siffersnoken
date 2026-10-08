<?php
return [
    'dsn' => 'mysql:host=mysqlXXX.loopia.se;dbname=DIN_DATABAS;charset=utf8mb4',
    'user' => 'DIN_DATABASANVANDARE',
    'password' => 'DITT_DATABASLOSENORD',
    'origin' => 'https://siffersnoken.42improbableowls.com',
    // Generate locally with: php -r "echo bin2hex(random_bytes(32));"
    'secret' => 'BYT_TILL_EN_SLUMPMASSIG_HEMLIGHET_MED_MINST_64_TECKEN',
    // Generate with: php -r "echo password_hash('DITT_ADMINLOSENORD', PASSWORD_DEFAULT);"
    'admin_hash' => 'BYT_TILL_PASSWORD_HASH',
    'blocked_names' => [],
];
