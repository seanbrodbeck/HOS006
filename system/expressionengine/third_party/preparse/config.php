<?php if ( ! defined('EXT')) exit('No direct script access allowed');

/**
 * Preparse - Config
 *
 * NSM Addon Updater config file.
 *
 * @package		Solspace:Preparse
 * @author		Solspace, Inc.
 * @copyright	Copyright (c) 2008-2013, Solspace, Inc.
 * @link		http://solspace.com/docs/preparse
 * @license		http://www.solspace.com/license_agreement
 * @version		2.1.0
 * @filesource	preparse/config.php
 */

require_once 'constants.preparse.php';

$config['name']    								= 'Preparse';
$config['version'] 								= PREPARSE_VERSION;
$config['nsm_addon_updater']['versions_xml'] 	= 'http://www.solspace.com/software/nsm_addon_updater/preparse';
