<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Structure Fieldtype
 *
 * This file must be in your /system/third_party/structure directory of your ExpressionEngine installation
 *
 * @package             StructureFrame for EE2
 * @author              Jack McDade (jack@jackmcdade.com)
 * @copyright           Copyright (c) 2012 Travis Schmeisser
 * @link                http://buildwithstructure.com
 */

require_once PATH_THIRD.'structure/config.php';
require_once PATH_THIRD.'structure/sql.structure.php';

class Structure_ft extends EE_Fieldtype {

	var $info = array(
		'name'		=> 'StructureFrame',
		'version'	=> STRUCTURE_VERSION
	);
	var $structure;
	var $sql;
	
	/**
	 * Constructor
	 *
	 * @access	public
	 */
	function Structure_ft()
	{
		parent::EE_Fieldtype();
	
		$this->sql = new Sql_structure();
		$this->site_pages = $this->sql->get_site_pages();
		$this->site_id = $this->EE->config->item('site_id');
		
	}
	
	// --------------------------------------------------------------------
	
		
	/**
     * Normal Fieldtype Display
     */
	function display_field($data)
	{	
		return $this->_pages_select($data, $this->field_name, $this->field_id);
	}
	
	
	/**
     * Matrix Cell Display
     */
	function display_cell($data)
	{	
		return $this->_pages_select($data, $this->cell_name, $this->field_id);
	}
	
	
	/**
     * Low Variables Fieldtype Display
	 *
	 * @return int entry_id of selected URL
     */
    function display_var_field($data)
    {
		return $this->_pages_select($data, $this->field_name);
    }


	/**
     * Low Variables Fieldtype Var Tag
	 *
	 * @return string url
     */
	function display_var_tag($var_data, $tagparams, $tagdata)
	{
		return $this->EE->functions->create_page_url($this->site_pages['url'], $this->site_pages['uris'][$var_data], false);
	}
    
	
	// --------------------------------------------------------------------
	
	/**
    * Structure Pages Select
    *
    * @return string select HTML
    * @access private
    */
	private function _pages_select($data, $name, $field_id = false)
	{
		$structure_data = $this->sql->get_data();
		
		$exclude_status_list[] = "closed";
		$closed_parents = array();

		foreach ($structure_data as $key => $entry_data)
		{
			if (in_array(strtolower($entry_data['status']), $exclude_status_list) || in_array($entry_data['parent_id'], $closed_parents))
			{
				$closed_parents[] = $entry_data['entry_id'];
				unset($structure_data[$key]);
			}
		}
		
		$structure_data = array_values($structure_data);

		$options = array();
		$options[''] = "-- None --";
		
		foreach ($structure_data as $page)
		{		
			$options[$page['entry_id']] = str_repeat('--', $page['depth']) . $page['title'];
		}
		
		return form_dropdown($name, $options, $data);
	}

	// --------------------------------------------------------------------
	
	function replace_tag($data, $params = '', $tagdata = '')
	{	
		if ($data != "" && is_numeric($data))
		{
			$uri = isset($this->site_pages['uris'][$data]) ? $this->site_pages['uris'][$data] : NULL;
			return $this->EE->functions->remove_double_slashes(trim($this->EE->functions->fetch_site_index(0, 0), '/') . $uri);
		}
		return FALSE;
	}
}

// END Structure_ft class

/* End of file ft.structure.php */
/* Location: ./system/expressionengine/third_party/structure/ft.structure.php */