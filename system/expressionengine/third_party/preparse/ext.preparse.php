<?php if ( ! defined('EXT')) exit('No direct script access allowed');

/**
 * Preparse - Extension
 *
 * @package		Solspace:Preparse
 * @author		Solspace, Inc.
 * @copyright	Copyright (c) 2008-2013, Solspace, Inc.
 * @link		http://solspace.com/docs/preparse
 * @license		http://www.solspace.com/license_agreement
 * @version		2.1.0
 * @filesource	preparse/ext.preparse.php
 */

require_once 'addon_builder/extension_builder.php';

class Preparse_ext extends Extension_builder_preparse
{
	// --------------------------------------------------------------------

	/**
	 * Constructor
	 *
	 * @access	public
	 * @return	null
	 */

	public function __construct($settings = '')
	{
		parent::__construct();

		/** --------------------------------------------
		/**  Settings
		/** --------------------------------------------*/

		$this->settings_exist = 'y';

		$this->settings = $settings;

		/** --------------------------------------------
		/**  Extension Hooks
		/** --------------------------------------------*/

		$this->default_settings	= array();

		$default = array(	'class'        => $this->extension_name,
							'settings'     => serialize($this->settings),
							'priority'     => 10,
							'version'      => $this->version,
							'enabled'      => 'y'
							);

		/** --------------------------------------------
		/**  ExpressionEngine 1.x Hooks
		/** --------------------------------------------*/

			$this->hooks = array(array_merge($default,
											array('method'	=> 'entry_submission_end',
												  'hook'	=> 'entry_submission_end')));

		/** --------------------------------------------
		/**  Update to New Version - Required
		/** --------------------------------------------*/

		if (isset($this->EE->extensions->version_numbers[$this->extension_name])  && $this->version_compare($this->version, '>', $this->EE->extensions->version_numbers[$this->extension_name]))
		{
			$this->update_extension_hooks();
		}
	}
	/* Constructor */


	// --------------------------------------------------------------------

	/**
	 * Entry Submission Redirect
	 *
	 */

	public function entry_submission_end($id, $meta, $data)
	{
		$this->submit_new_entry_end($id, array_merge($data, $meta), '');
	}
	 /* END entry_submission_redirect */


	// --------------------------------------------------------------------

	/**
	 * Build the ToolBar variables for the Page
	 *
	 *
	 * @access	public
	 * @return	null
	 */

	public function submit_new_entry_end( $entry_id, $data, $ping_message )
	{
		if (sizeof($this->settings) == 0) return;

		/** --------------------------------------------
		/**  Fetch Meta Data
		/** --------------------------------------------*/

		$channel = $this->EE->db->query( "SELECT w.field_group, w.{$this->sc->db->channel_name}, w.{$this->sc->db->channel_id} FROM {$this->sc->db->channels} w
							   LEFT JOIN {$this->sc->db->channel_titles} t ON w.{$this->sc->db->channel_id} = t.{$this->sc->db->channel_id}
							   WHERE t.entry_id = '".$this->EE->db->escape_str($entry_id)."'
							   LIMIT 1" );

		if ($channel->num_rows() == 0) return; // Weird...

		/** --------------------------------------------
		/**  Any Settings for this Channel?
		/** --------------------------------------------*/

		if ( empty($this->settings[$channel->row($this->sc->db->channel_id)]))
		{
			return;
		}

		// -----------------------------------------
		// Fetch fields
		// -----------------------------------------

		$fields	= $this->EE->db->query("SELECT f.field_id, f.field_name FROM {$this->sc->db->channel_fields} f
							  WHERE f.group_id = '".$this->EE->db->escape_str($channel->row('field_group'))."'" );

		if ($fields->num_rows() == 0) return;

		// -----------------------------------------
		// Fetch entry data
		// -----------------------------------------

		foreach ( $fields->result_array() as $row )
		{
			$sel[] = 'field_id_'.$row['field_id'].' AS `id_'.$row['field_id'].'`';
			$sel[] = 'field_id_'.$row['field_id'].' AS `'.$row['field_name'].'`';
			$sel[] = 'field_ft_'.$row['field_id'].' AS `fmt_'.$row['field_name'].'`';
		}

		$entry	= $this->EE->db->query( "SELECT ".implode(',', $sel)." FROM {$this->sc->db->channel_data}
									WHERE entry_id = '".$this->EE->db->escape_str($entry_id)."' LIMIT 1" );

		/** --------------------------------------------
		/**  Fetch Our Templates
		/** --------------------------------------------*/

		$template_ids	= array();
		$templates		= array();

		foreach ( $this->settings[$channel->row($this->sc->db->channel_id)] as $field_id => $settings )
		{
			$template_ids[]  = $settings['template_id'];
		}

		if (sizeof($template_ids) == 0) return;

		$query = $this->EE->db->query("SELECT template_id, template_data, group_name, template_name, template_type, allow_php, php_parse_location
								  FROM exp_templates AS t, exp_template_groups AS tg
								  WHERE tg.group_id = t.group_id
								  AND t.template_id IN ('".implode("','", $this->EE->db->escape_str($template_ids))."')");

		foreach($query->result_array() as $row)
		{
			$templates[$row['template_id']] = $row;
		}

		/** -------------------------------------
		/**	Load Template Parser and Typography
		/** -------------------------------------*/

		require_once 'addon_builder/parser.addon_builder.php';

		$this->EE->load->library('typography');

		/** --------------------------------------------
		/**  Do Our Field Parsing
		/** --------------------------------------------*/

		foreach ( $this->settings[$channel->row($this->sc->db->channel_id)] as $field_id => $settings )
		{
			if ( ! isset($templates[$settings['template_id']]))
			{
				continue;
			}

			$data			= $templates[$settings['template_id']];
			$template_data	= stripslashes($data['template_data']);

			/** --------------------------------------------
			/**  Template as File?
			/** --------------------------------------------*/

			if ($this->EE->config->item('save_tmpl_files') == 'y' AND $this->EE->config->item('tmpl_file_basepath') != '')
			{
				$basepath = rtrim($this->EE->config->item('tmpl_file_basepath'), '/').'/';

				if (APP_VER < 2.0)
				{
					$basepath .= $data['group_name'].'/'.$data['template_name'].'.php';
				}
				else
				{
					$this->EE->load->library('api');
					$this->EE->api->instantiate('template_structure');
					$basepath .= $this->EE->config->item('site_short_name').'/'.
								 $data['group_name'].'.group/'.
								 $data['template_name'].
								 $this->EE->api_template_structure->file_extensions($data['template_type']);
				}

				if (file_exists($basepath))
				{
					$template_data = file_get_contents($basepath);
				}
			}

			/** --------------------------------------------
			/**  Prepare Variables
			/** --------------------------------------------*/

			$vars['preparse_data']		= $entry->row( 'id_'.$field_id );
			$vars['preparse_entry_id']	= $entry_id;

			/** -------------------------------------
			/**	Parse
			/** -------------------------------------*/

			$this->EE->TMPL = $GLOBALS['TMPL'] = new Addon_builder_parser_preparse();

			$this->EE->TMPL->encode_email = FALSE;

			$this->EE->TMPL->parse_php = $templates[$settings['template_id']]['allow_php'] == 'y' ? TRUE : FALSE;

			$this->EE->TMPL->php_parse_location = $templates[$settings['template_id']]['php_parse_location'] == 'i' ? 'input' : 'output';

			$this->EE->TMPL->global_vars	= array_merge($this->EE->TMPL->global_vars, $vars);

			$out = $GLOBALS['TMPL']->process_string_as_template($template_data);

			/** --------------------------------------------
			/**  Parse Typography
			/** --------------------------------------------*/

			if (APP_VER >= 2.0)
			{
				$this->EE->typography->initialize();
			}

			$this->EE->typography->smileys			= FALSE;
			$this->EE->typography->highlight_code	= TRUE;

			$formatting['html_format']		= 'all';
			$formatting['auto_links']		= 'n';
			$formatting['allow_img_url']	= 'y';
			$formatting['text_format']		= 'none';

			// Disables the CP URL redirect code in a simple way
			$old_m_get = (isset($_GET['M'])) ? $_GET['M'] : NULL;
			$_GET['M'] = 'send_email';

			$body = $this->EE->typography->parse_type(stripslashes($this->EE->security->xss_clean($out)), $formatting);

			$_GET['M'] = $old_m_get;

			/** --------------------------------------------
			/**  Prepare Our Insert
			/** --------------------------------------------*/

			if ( trim($body) != '' )
			{
				$insert[ 'field_id_'.$settings['outgoing_field_id'] ] = $body;
			}
		}

		// -----------------------------------------
		// Update DB
		// -----------------------------------------

		if ( ! empty($insert))
		{
			$this->EE->db->query( $this->EE->db->update_string( $this->sc->db->channel_data, $insert, array('entry_id' => $entry_id) ) );
		}

		return;
	}
	/* END parse() */


	// --------------------------------------------------------------------

	/**
	 * Settings Form
	 *
	 * @access	public
	 * @return	null
	 */

	public function settings_form($current)
	{
		/** --------------------------------------------
		/**  Bug Fix for When EE does not send us an array
		/** --------------------------------------------*/

		if (is_string($current))
		{
			$current = array();
		}

		/** -------------------------------------
		/**  Docs URL
		/** -------------------------------------*/

		$this->cached_vars['docs_url'] = $this->EE->functions->fetch_site_index().QUERY_MARKER.'URL='.$this->docs_url;

		/** ----------------------------------
		/**  Default Arrays
		/** ----------------------------------*/

		foreach($this->data->get_sites() as $site_id => $site_label)
		{
			$this->cached_vars['sites'][$site_id] = $site_label;
			$this->cached_vars['channels'][$site_id] = array();
			$this->cached_vars['templates'][$site_id] = array();
		}

		$this->cached_vars['custom_fields'] = array();

		/** ----------------------------------
		/**  List of Channels
		/** ----------------------------------*/

		$channels_query = $this->EE->db->query("SELECT {$this->sc->db->channel_id}, field_group, site_id, {$this->sc->db->channel_title}, status_group
									 FROM {$this->sc->db->channels}
									 ORDER BY {$this->sc->db->channel_title}");

		foreach($channels_query->result_array() as $row)
		{
			$this->cached_vars['channels'][$row['site_id']][$row[$this->sc->db->channel_id]]	= $row[$this->sc->db->channel_title];
			$this->cached_vars['custom_fields'][$row[$this->sc->db->channel_id]]				= array();
			$this->cached_vars['form_fields'][$row[$this->sc->db->channel_id]]					= array();
		}

		$this->cached_vars['display']['default_field_id']	= '';
		$this->cached_vars['display']['default_site_id']	= $this->EE->config->item('site_id');
		$this->cached_vars['display']['default_channel_id']	= key($this->cached_vars['channels'][$this->EE->config->item('site_id')]);

		/** ----------------------------------
		/**  List of Custom Fields
		/** ----------------------------------*/

		$fields_query = $this->EE->db->query("SELECT field_id, field_label, group_id
									 FROM {$this->sc->db->channel_fields} ORDER BY group_id, field_order");

		foreach($channels_query->result_array() as $wrow)
		{
			foreach($fields_query->result_array() as $frow)
			{
				if ($wrow['field_group'] == $frow['group_id'])
				{
					$this->cached_vars['custom_fields'][$wrow[$this->sc->db->channel_id]][$frow['field_id']] = $frow['field_label'];

					// Default Field ID for Default Channel
					if ($wrow[$this->sc->db->channel_id] == $this->cached_vars['display']['default_channel_id'] &&
						empty($this->cached_vars['display']['default_field_id']))
					{
						$this->cached_vars['display']['default_field_id'] = $frow['field_id'];
					}
				}
			}
		}

		unset($fields_query);
		unset($channels_query);
		unset($your_mom); // Hee hee...

		/** ----------------------------------
		/**  List of Templates
		/** ----------------------------------*/

		$templates_query = $this->EE->db->query("SELECT t.site_id, t.template_id, t.template_name, tg.group_name
									   FROM exp_templates AS t, exp_template_groups AS tg
									   WHERE t.group_id = tg.group_id
									   AND t.template_type IN ('webpage')");

		foreach($templates_query->result_array() as $row)
		{
			$this->cached_vars['templates'][$row['site_id']][$row['group_name']][$row['template_id']] = $row['template_name'];
		}

		unset($template_query);

		/** --------------------------------------------
		/**  Build Form Fields!
		/** --------------------------------------------*/

		foreach($this->cached_vars['channels'] AS $site_id => $channels)
		{
			foreach($channels as $channel_id => $channel_title)
			{
				foreach($this->cached_vars['custom_fields'][$channel_id] as $custom_field_id => $custom_field_label)
				{
					if ( ! isset($current[$channel_id][$custom_field_id]['outgoing_field_id']))
					{
						$current[$channel_id][$custom_field_id]['outgoing_field_id'] = '';
					}

					if ( ! isset($current[$channel_id][$custom_field_id]['template_id']))
					{
						$current[$channel_id][$custom_field_id]['template_id'] = '';
					}
				}
			}
		}

		$this->cached_vars['current'] = $current;

		/** --------------------------------------------
		/**  Load Homepage
		/** --------------------------------------------*/

		return $this->ee_cp_view('settings_form.html');
	}
	/* END settings_form() */



	// --------------------------------------------------------------------

	/**
	 * Settings Form Array - EMPTY
	 *
	 * @access	public
	 * @return	null
	 */

	public function save_settings()
	{
		$settings = array();

		/** --------------------------------------------
		/**  Site Templates
		/** --------------------------------------------*/

		$templates = array();

		$query = $this->EE->db->query("SELECT template_id, site_id FROM exp_templates");

		foreach($query->result_array() as $row)
		{
			$templates[$row['site_id']][$row['template_id']] = '';
		}

		/** ----------------------------------
		/**  Check Channels with Custom Fields
		/** ----------------------------------*/

		$channels_query = $this->EE->db->query("SELECT {$this->sc->db->channel_id}, site_id, field_group
									 FROM {$this->sc->db->channels} ORDER BY {$this->sc->db->channel_title}");

		$fields_query = $this->EE->db->query("SELECT field_id, group_id
									FROM {$this->sc->db->channel_fields} ORDER BY group_id, field_order");

		foreach($channels_query->result_array() as $wrow)
		{
			foreach($fields_query->result_array() as $frow)
			{
				if ($wrow['field_group'] == $frow['group_id'])
				{
					$prefix = $wrow[$this->sc->db->channel_id].'_'.$frow['field_id'];

					if ( empty($_POST[$prefix.'_outgoing_field_id']) OR ! ctype_digit($_POST[$prefix.'_outgoing_field_id']))
					{
						continue;
					}

					if ( empty($_POST[$prefix.'_template_id']) OR ! isset($templates[$wrow['site_id']][$_POST[$prefix.'_template_id']]))
					{
						continue;
					}

					$settings[$wrow[$this->sc->db->channel_id]][$frow['field_id']] = array('outgoing_field_id'	=> $_POST[$prefix.'_outgoing_field_id'],
																							'template_id'		=> $_POST[$prefix.'_template_id']);
				}
			}
		}

		unset($fields_query);
		unset($channels_query);

		/** --------------------------------------------
		/**  Insert
		/** --------------------------------------------*/


			$this->EE->db->where('class', $this->extension_name);
			$this->EE->db->update('extensions', array('settings' => serialize($settings)));

			$this->EE->session->set_flashdata('message_success', lang('preferences_updated'));

		return TRUE;
	}
	/* END settings() */

	// --------------------------------------------------------------------

}
/* END Class Preparse */

/* End of file ext.preparse.php */
/* Location: ./system/extensions/preparse/ext.preparse.php */
