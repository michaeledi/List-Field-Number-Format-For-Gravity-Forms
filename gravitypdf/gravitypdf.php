<?php
	add_filter( 'gfpdf_field_class', 'decode_isnumber_gravitypdf_4_1' , 10, 3 );

	/*
	* Add Gravity PDF 4.0 support
	*/
	function decode_isnumber_gravitypdf_4_1( $class, $field, $entry ) {
		if ( 'list' == $field->type ) {
			$has_columns = is_array( $field->choices );
			if ( $has_columns ) {
				foreach( $field['choices'] as $choice ) {
					if ( rgar( $choice, 'isNumber' ) )  {
						require_once( plugin_dir_path( __FILE__ ).'ITSG_GF_isNumber_Field.php' );
						$class = new GFPDF\Helper\Fields\ITSG_GF_isNumber_Field( $field, $entry, GPDFAPI::get_form_class(), GPDFAPI::get_misc_class() );
					}
				}
			} else {
				if ( $field->isNumber ) {
					require_once( plugin_dir_path( __FILE__ ).'ITSG_GF_isNumber_Field.php' );
					$class = new GFPDF\Helper\Fields\ITSG_GF_isNumber_Field( $field, $entry, GPDFAPI::get_form_class(), GPDFAPI::get_misc_class() );
				}
			}
		}
		return $class;
	}