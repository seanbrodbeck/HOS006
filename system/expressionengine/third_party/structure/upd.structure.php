<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD.'structure/config.php';
require_once PATH_THIRD.'structure/sql.structure.php';
require_once PATH_THIRD.'structure/mod.structure.php';

class Structure_upd {

    var $version = STRUCTURE_VERSION;

    function Structure_upd($switch = TRUE)
    {
		$this->EE =& get_instance();
		$this->sql = new Sql_structure();
		$this->structure = new Structure();
    }

	function tabs()
	{
		return array('structure' => array(
			'parent_id' => array(
								'visible'		=> TRUE,
								'collapse'		=> FALSE,
								'htmlbuttons'	=> 'true',
								'width'			=> '100%'
								),
			'uri' => array(
								'visible'		=> TRUE,
								'collapse'		=> FALSE,
								'htmlbuttons'	=> 'true',
								'width'			=> '100%'
								),
			'template_id' => array(
								'visible'		=> TRUE,
								'collapse'		=> FALSE,
								'htmlbuttons'	=> 'true',
								'width'			=> '100%'
								),
			'hidden' => array(
								'visible'		=> TRUE,
								'collapse'		=> FALSE,
								'htmlbuttons'	=> 'true',
								'width'			=> '100%'
								),
			'listing_channel' => array(
								'visible'		=> TRUE,
								'collapse'		=> FALSE,
								'htmlbuttons'	=> 'true',
								'width'			=> '100%'
								)
			)
		);
	}


	function install()
	{
		$pages_check = $this->EE->db->query("SELECT * FROM exp_modules WHERE module_name = 'Pages'");
		if ($pages_check->num_rows > 0)
		{
			show_error('Please Uninstall the "Pages" module before installing Structure. You\'ll be happy you did.', 500, 'Ruh Roh!');
			return FALSE;
		}		
		
		$this->EE->load->dbforge(); 

		// Module data
		$data = array(
			'module_name' => STRUCTURE_NAME,
			'module_version' => $this->version,
			'has_cp_backend' => 'y',
			'has_publish_fields' => 'y'
		);

		$this->EE->db->insert('modules', $data);

		// Insert actions
		$data = array(
			'class' => 'Structure',
			'method' => 'ajax_move_set_data'
		);

		$this->EE->db->insert('actions', $data);
		
		$results = $this->EE->db->query("SELECT * FROM exp_sites");

		if ( ! in_array('site_pages', $results->result_array()))
		{
			// ALTER EE TABLES
			$fields = array('site_pages' => array('type' => 'longtext'));
			$this->EE->dbforge->add_column('sites', $fields);
		}

		// Create Structure Settings Table
		$fields = array(
			'id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'auto_increment' => TRUE),
			'site_id'	=>	array('type' => 'int', 'constraint' => '8', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '1'),
			'var'		=>	array('type' => 'varchar', 'constraint' => '60', 'null' => FALSE),
			'var_value'	=>	array('type' => 'varchar', 'constraint' => '100', 'null' => FALSE)
		);

		$this->EE->dbforge->add_field($fields);
		$this->EE->dbforge->add_key('id', TRUE);
		$this->EE->dbforge->create_table('structure_settings');	

		// Create Structure Table
		$fields = array(
			'site_id'		=>	array('type' => 'int', 'constraint' => '4',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '1'),
			'entry_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'parent_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'channel_id'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'listing_cid'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'lft'			=>	array('type' => 'smallint', 'constraint' => '5',   'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'rgt'			=>	array('type' => 'smallint', 'constraint' => '5',   'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'dead'			=>	array('type' => 'varchar',  'constraint' => '100', 'null' => FALSE),
			'hidden'        => array('type' => 'char', 'null' => FALSE, 'default' => 'n')
			
		);

		$this->EE->dbforge->add_field($fields);
		$this->EE->dbforge->add_key('entry_id', TRUE);
		$this->EE->dbforge->create_table('structure');
		
		// Create Structure Channels Table
		$fields = array(
			'site_id' 		=> array('type' => 'smallint', 	'unsigned' => TRUE, 'null' => FALSE),
			'channel_id' 	=> array('type' => 'mediumint', 'unsigned' => TRUE, 'null' => FALSE),
			'template_id' 	=> array('type' => 'int', 'unsigned' => TRUE, 'null' => FALSE),
			'type' 			=> array('type' => 'enum', 'constraint' => '"page", "listing", "asset", "unmanaged"', 'null' => FALSE, 'default' => 'unmanaged'),
			'split_assets'	=> array('type' => 'enum', 'constraint' => '"y", "n"', 'null' => FALSE, 'default' => 'n'),
			'show_in_page_selector' => array('type' => 'char', 'null' => FALSE, 'default' => 'y')
		);
		
		$this->EE->dbforge->add_field($fields);
		$this->EE->dbforge->add_key(array('site_id', 'channel_id'), TRUE);
		$this->EE->dbforge->create_table('structure_channels');
		
		// Create Structure Listing Table
		$fields = array(
			'site_id'		=>	array('type' => 'int', 'constraint' => '4',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '1'),
			'entry_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'parent_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'channel_id'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'template_id'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
			'uri'			=>	array('type' => 'varchar', 'constraint' => '75', 'null' => FALSE)
		);

		$this->EE->dbforge->add_field($fields);
		$this->EE->dbforge->add_key('entry_id', TRUE);
		$this->EE->dbforge->create_table('structure_listings');
		
		$this->add_table_structure_members();

		// Insert the root node
		$data = array('site_id' => '0', 'entry_id' => '0', 'parent_id' => '0', 'channel_id' => '0', 'listing_cid' => '0', 'lft' => '1', 'rgt' => '2', 'dead' => 'root');
		$sql = $this->EE->db->insert_string('structure', $data);
		$this->EE->db->query($sql);

		// Insert the action id
		$action_id  = $this->EE->cp->fetch_action_id('Structure', 'ajax_move_set_data');
		$data = array('id' => '', 'site_id' => 0, 'var' => 'action_ajax_move', 'var_value' => $action_id);
		$sql = $this->EE->db->insert_string('structure_settings', $data);
		$this->EE->db->query($sql);

		// Insert the module id
		$results = $this->EE->db->query("SELECT * FROM exp_modules WHERE module_name = 'Structure'");
		$module_id = $results->row('module_id');
			
		$sql = array();
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 0, 'module_id', " . $module_id . ")";
					
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'show_picker', 'y')";
					
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'show_view_page', 'y')";
				
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'show_global_add_page', 'y')";
					
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'hide_hidden_templates', 'y')";
					
		$sql[] =
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'redirect_on_login', 'n')";
				
		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'redirect_on_publish', 'n')";

		$sql[] = 
					"INSERT IGNORE INTO exp_structure_settings ".
					"(id, site_id, var, var_value) VALUES ".
					"('', 1, 'add_trailing_slash', 'y')";
					
		
		foreach ($sql as $query)
		{
			$this->EE->db->query($query);
		}
		
		$this->EE->load->library('layout');
		$this->EE->layout->add_layout_tabs($this->tabs(), 'structure');

	    return TRUE;

	}


	function uninstall()
	{

		$this->EE->load->dbforge();
		$this->EE->db->select('module_id');
		$query = $this->EE->db->get_where('modules', array('module_name' => 'Structure'));

		$this->EE->db->where('module_name', 'Structure');
		$this->EE->db->delete('modules');
		
		$this->EE->db->where('class', 'ajax_move_set_data');
		$this->EE->db->delete('actions');

		$this->EE->db->where('class', 'Structure');
		$this->EE->db->delete('actions');

		$this->EE->db->where('class', 'Structure_mcp');
		$this->EE->db->delete('actions');

		$this->EE->db->query("ALTER TABLE exp_sites DROP site_pages");

		$this->EE->dbforge->drop_table('structure_members');
		$this->EE->dbforge->drop_table('structure_settings');
		$this->EE->dbforge->drop_table('structure_channels');
		$this->EE->dbforge->drop_table('structure_listings');
		$this->EE->dbforge->drop_table('structure');
		
		$this->EE->load->library('layout');
		$this->EE->layout->delete_layout_tabs($this->tabs());

	    return TRUE;

	}


	function add_table_structure_members()
	{
		if ( ! $this->EE->db->table_exists('structure_members'))
		{
			$fields = array(
				'member_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => TRUE, 'default' => 0),
				'site_id'		=>	array('type' => 'int', 'constraint' => '4',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '1'),
				'nav_state'		=>	array('type' => 'text', 'null' => TRUE)
			);

			$this->EE->dbforge->add_field($fields);
			$this->EE->dbforge->add_key(array('site_id', 'member_id'), TRUE);
			$this->EE->dbforge->create_table('structure_members');	
		}
	}
	

	function update($current = '')
	{
		if ($current == '' OR $current == $this->version)
			return FALSE;
			
		$this->EE->load->dbforge();

		if ($current < '2.1.3' || ($current < '3.0' && $this->check_for_listings() == FALSE))
		{
			require_once('mod.structure.php');
			$this->structure = new Structure();
			
			require_once('libraries/nestedset/structure_nestedset.php');
			require_once('libraries/nestedset/structure_nestedset_adapter_ee.php');
			$adapter	= new Structure_Nestedset_Adapter_Ee('exp_structure', 'lft', 'rgt', 'entry_id');
			$this->nset = new Structure_Nestedset($adapter);
			
			$site_id = $this->EE->config->item('site_id');
			$site_pages = $this->sql->get_site_pages();
			
			// Create Structure Listing Table
			$fields = array(
				'site_id'		=>	array('type' => 'int', 'constraint' => '4',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '1'),
				'entry_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
				'parent_id'		=>	array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
				'channel_id'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
				'template_id'	=>	array('type' => 'int', 'constraint' => '6',  'unsigned' => TRUE, 'null' => FALSE, 'default' => '0'),
				'uri'			=>	array('type' => 'varchar', 'constraint' => '75', 'null' => FALSE)
			);

			$this->EE->dbforge->add_field($fields);
			$this->EE->dbforge->add_key('entry_id', TRUE);
			$this->EE->dbforge->create_table('structure_listings');
			
			foreach($site_pages['uris'] as $entry_id => $uri)
			{
				$slug = explode('/', $uri);
				
				// Knock the first and last elements off the array, they're blank.
				array_pop($slug);
				array_shift($slug);
				
				// Get the last segment, the Structure URI for the page.
				$slug = end($slug);
				
				// See if its a node or listing item
				$node = $this->nset->getNode($entry_id);

				// If we have an entry id but no node, we have listing entry
				if ($entry_id && ! $node)
				{
					$pid = $this->structure->get_pid_for_listing_entry($entry_id);
					
					// Get the channel ID for the listing
					$results = $this->EE->db->query("SELECT channel_id FROM exp_channel_titles WHERE entry_id = $entry_id");
					$channel_id = $results->row('channel_id');
					
					// Get the template ID for the listing
					$template_id = $site_pages['templates'][$entry_id];

					// Insert the root node
					$data = array('site_id' => $site_id, 'entry_id' => $entry_id, 'parent_id' => $pid, 'channel_id' => $channel_id, 'template_id' => $template_id, 'uri' => $slug);
					$sql = $this->EE->db->insert_string('structure_listings', $data);
					$this->EE->db->query($sql);
				}
			}
		}

		if ($current < '2.2.2')
		{
			$sql = array();
			
			$sql[] = 
						"INSERT IGNORE INTO exp_structure_settings ".
						"(id, site_id, var, var_value) VALUES ".
						"('', 1, 'redirect_on_login', 'n')";

			$sql[] = 
						"INSERT IGNORE INTO exp_structure_settings ".
						"(id, site_id, var, var_value) VALUES ".
						"('', 1, 'redirect_on_publish', 'n')";

			foreach ($sql as $query)
				$this->EE->db->query($query);
				
		}

		if ($current < '3.0.3')
		{
			$sql = "ALTER TABLE exp_structure_channels ADD split_assets enum('y','n') NOT NULL default 'n'";
			$this->EE->db->query($sql);
		}

		if ($current < '3.0.4')
		{
			$sql = array();
			$sql[] = "ALTER TABLE `exp_structure` ADD INDEX `lft` (`lft`)";
			$sql[] = "ALTER TABLE `exp_structure` ADD INDEX `rgt` (`rgt`)";
			
			foreach ($sql as $query)
    			$this->EE->db->query($query);

		}

		if ($current < '3.1')
		{
			$this->add_table_structure_members();
			$this->EE->db->query("ALTER TABLE exp_structure ADD hidden char NOT NULL default 'n'");
			$this->EE->db->query("ALTER TABLE exp_structure_channels ADD show_in_page_selector char NOT NULL default 'y'");
			
			$this->EE->load->library('layout');
			$this->EE->layout->delete_layout_tabs($this->tabs()); // Blow out the old tab
			$this->EE->layout->add_layout_tabs($this->tabs(), 'structure'); // Update to new tab for "Hide From Nav field"
			
		}	

		if ($current < '3.2.2')
		{
			$this->EE->db->query("ALTER TABLE exp_structure_members drop primary key");
			$this->EE->db->query("ALTER TABLE exp_structure_members ADD primary key (site_id,member_id)");
		}
		if ($current < '3.3')
		{
			// Strip trailing slashes on module update
			$site_id = $this->EE->config->item('site_id');
			$site_pages = $this->sql->get_site_pages();
			$uris = $site_pages['uris'];

			foreach ($uris as $entry_id => $uri)
			{
				if ($uri != "/") {
					$site_pages['uris'][$entry_id] = rtrim($uri, '/');
				}
			}
			$this->structure->set_site_pages($site_id, $site_pages);
		}

		if ($current < '3.3.1')
		{
			$sql = array();
			
			$sql[] = 
						"INSERT IGNORE INTO exp_structure_settings ".
						"(id, site_id, var, var_value) VALUES ".
						"('', 1, 'add_trailing_slash', 'y')";

			foreach ($sql as $query)
				$this->EE->db->query($query);
		}
		
	}
	
	function check_for_listings()
	{
		$results = $this->EE->db->query("show tables like 'exp_structure_listings'");

		if ($results->num_rows() == 0)
			return FALSE;

		return TRUE;
	}

}
/* END Class */

/* End of file upd.structure.php */
/* Location: ./system/expressionengine/third_party/structure/upd.structure.php */