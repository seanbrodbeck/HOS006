<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$active_group = 'live';
$active_record = TRUE;

$db['expressionengine']['hostname'] = '216.70.96.207';
$db['expressionengine']['username'] = 'faculty';
$db['expressionengine']['password'] = 'scr@ppl3';
$db['expressionengine']['database'] = 'headsofstate';
$db['expressionengine']['dbdriver'] = 'mysql';
$db['expressionengine']['pconnect'] = FALSE;
$db['expressionengine']['dbprefix'] = 'exp_';
$db['expressionengine']['swap_pre'] = 'exp_';
$db['expressionengine']['db_debug'] = FALSE;
$db['expressionengine']['cache_on'] = FALSE;
$db['expressionengine']['autoinit'] = FALSE;
$db['expressionengine']['char_set'] = 'utf8';
$db['expressionengine']['dbcollat'] = 'utf8_general_ci';
$db['expressionengine']['cachedir'] = '/Users/hc_wagner/Sites/hos-app/system/expressionengine/cache/db_cache/';

$db['local']['hostname'] = 'localhost:8889';
$db['local']['username'] = 'root';
$db['local']['password'] = 'root';
$db['local']['database'] = 'headsofstate';
$db['local']['dbdriver'] = 'mysql';
$db['local']['pconnect'] = FALSE;
$db['local']['dbprefix'] = 'exp_';
$db['local']['swap_pre'] = 'exp_';
$db['local']['db_debug'] = FALSE;
$db['local']['cache_on'] = FALSE;
$db['local']['autoinit'] = FALSE;
$db['local']['char_set'] = 'utf8';
$db['local']['dbcollat'] = 'utf8_general_ci';
$db['local']['cachedir'] = '/Users/bueno/Sites/hos/hos005/system/expressionengine/cache/db_cache/';

$db['live']['hostname'] = 'internal-db.s24032.gridserver.com';
$db['live']['username'] = 'db24032_faculty';
$db['live']['password'] = 'Scrapple1!';
$db['live']['database'] = 'db24032_headsofstate_ee';
$db['live']['dbdriver'] = 'mysql';
$db['live']['pconnect'] = FALSE;
$db['live']['dbprefix'] = 'exp_';
$db['live']['swap_pre'] = 'exp_';
$db['live']['db_debug'] = FALSE;
$db['live']['cache_on'] = FALSE;
$db['live']['autoinit'] = FALSE;
$db['live']['char_set'] = 'utf8';
$db['live']['dbcollat'] = 'utf8_general_ci';
$db['live']['cachedir'] = '/Users/bueno/Sites/hos/hos005/system/expressionengine/cache/db_cache/';

/* End of file database.php */
/* Location: ./system/expressionengine/config/database.php */