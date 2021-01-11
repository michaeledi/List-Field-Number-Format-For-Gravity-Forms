<?php
/*
Plugin Name: List Field Number Format for Gravity Forms
Description: Turn your list field columns into repeatable number fields
Version: 1.6.5
Author: Adrian Gordon
Author URI: https://www.itsupportguides.com
License: GPL2
Text Domain: list-field-number-format-for-gravity-forms

------------------------------------------------------------------------
Copyright 2016 Adrian Gordon

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/

//------------------------------------------

if ( ! defined( 'ABSPATH' ) ) {
	die();
}

add_action( 'admin_notices', 'ITSG_GF_ListField_Number_Format_admin_warnings', 20 );

/*
* Warning message if Gravity Forms is installed and enabled
*/
function ITSG_GF_ListField_Number_Format_admin_warnings() {
	if ( ! ITSG_GF_ListField_Number_Format_is_gravityforms_installed() ) {
		printf(
			'<div class="error"><h3>%s</h3><p>%s</p><p>%s</p></div>',
				__( 'Warning', 'list-field-number-format-for-gravity-forms' ),
				sprintf ( __( 'The plugin %s requires Gravity Forms to be installed.', 'list-field-number-format-for-gravity-forms' ), '<strong>' . __( 'List Field Number Format for Gravity Forms', 'list-field-number-format-for-gravity-forms' ) .'</strong>' ),
				sprintf ( esc_html__( 'Please %sdownload the latest version of Gravity Forms%s (affiliate link) and try again.', 'list-field-number-format-for-gravity-forms' ), '<a href="https://rocketgenius.pxf.io/dbOK" target="_blank">', '</a>' )
		);
	}
} // END admin_warnings

function ITSG_GF_ListField_Number_Format_is_gravityforms_installed() {
	return class_exists( 'GFCommon' );
} // END is_gravityforms_installed

if ( class_exists( 'GFForms' ) ) {
    GFForms::include_addon_framework();

    class ITSG_GF_ListField_Number_Format extends GFAddOn {

        protected $_version = '1.6.5';
        protected $_min_gravityforms_version = '2';
        protected $_slug = 'list-field-number-format-for-gravity-forms';
        protected $_full_path = __FILE__;
        protected $_title = 'List Field Number Format for Gravity Forms';
        protected $_short_title = 'List Field Number Format';

        public function init() {
			parent::init();

			require_once( GFCommon::get_base_path() . '/currency.php' );

			add_action( 'gform_field_standard_settings', array( $this, 'field_settings' ) , 10, 2 );
			add_filter( 'gform_tooltips', array( $this, 'field_tooltip' ), 10, 1 );
			add_filter( 'gform_column_input_content', array( $this, 'change_column_content' ), 10, 6 );
			add_filter( 'gform_validation', array( $this, 'validate_number_values' ), 10, 1 );
			add_filter( 'gform_custom_merge_tags', array( $this, 'list_row_calculation_merge_tags' ), 10, 4 );
			add_filter( 'gform_pre_validation', array( $this,'list_row_calculation'), 10, 1 );
			add_filter( 'gform_get_field_value', array( $this, 'list_column_display_total' ), 10, 3 );

			//add_filter( 'gform_pre_render', array( $this, 'list_row_calculation' ) );
			//add_filter( 'gform_admin_pre_render', array( $this, 'list_row_calculation' ) );
			//add_filter( 'gform_pre_submission_filter', array( $this, 'list_row_calculation' ) );

			if ( self::is_minimum_php_version() ) {
				require_once( plugin_dir_path( __FILE__ ).'gravitypdf/gravitypdf.php' );
			}

        }

		/*
         * Check if PHP version is at least 5.4
         */
        private static function is_minimum_php_version() {
			return version_compare( phpversion(), '5.4', '>=' );
        } // END is_minimum_php_version

		public function scripts() {
			$min = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || isset( $_GET['gform_debug'] ) ? '' : '.min';
			$version = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || isset( $_GET['gform_debug'] ) ? mt_rand() : $this->_version;

			$scripts = array(
				array(
					'handle'    => 'itsg_gf_listnumformat_js',
					'src'       => $this->get_base_url() . "/js/itsg_gf_listnumformat_js{$min}.js",
					'version'   => $version,
					'deps'      => array( 'jquery' ),
					'enqueue'   => array( array( $this, 'form_has_list_number_field' ) ),
					'in_footer' => true,
					'callback'  => array( $this, 'localize_scripts' ),
				),
				array(
					'handle'    => 'itsg_gf_listnumformat_admin_js',
					'src'       => $this->get_base_url() . "/js/itsg_gf_listnumformat_admin_js{$min}.js",
					'version'   => $version,
					'deps'      => array( 'jquery' ),
					'enqueue'   => array( array( $this, 'requires_admin_js' ) ),
					'in_footer' => true,
					'callback'  => array( $this, 'localize_scripts_admin' ),
				)
			);

			 return array_merge( parent::scripts(), $scripts );
		} // END scripts

		public function styles() {
			$min = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || isset( $_GET['gform_debug'] ) ? '' : '.min';
			$version = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || isset( $_GET['gform_debug'] ) ? mt_rand() : $this->_version;

			$styles = array(
				array(
					'handle'  => 'itsg_gf_listnumformat_css',
					'src'     => $this->get_base_url() . "/css/itsg_gf_listnumformat_css{$min}.css",
					'version' => $version,
					'media'   => 'screen',
					'enqueue' => array( array( $this, 'form_has_list_number_field' ) ),
				),
			);

			return array_merge( parent::styles(), $styles );
		} // END styles

		function requires_admin_js() {
			return GFCommon::is_form_editor();
		} // END requires_admin_js

		public function localize_scripts( $form, $is_ajax ) {
			// Localize the script with data
			$default_isNumberFormat = apply_filters( 'itsg_gf_listfield_default_number_format', '' );
			$default_isNumberRounding = apply_filters( 'itsg_gf_listfield_default_number_rounding', '' );
			$is_entry_detail = GFCommon::is_entry_detail();
			$number_format_fields = array();

			if ( is_array( $form['fields'] ) ) {
				foreach ( $form['fields'] as $field ) {
					$field_type = $field->type;
					if ( 'list' == $field_type ) {
						$form_id = $form['id'];
						$field_id = $field->id;
						$has_columns = is_array( $field->choices );
						if ( $has_columns ) {
							foreach( $field->choices as $key => $choice ) {
								if ( rgar( $choice, 'isNumber' ) ) {
									$column_number = $key + 1;

									$isNumberFormat = strlen( $default_isNumberFormat) > 0 ? $default_isNumberFormat : rgar( $choice, 'isNumberFormat' );
									$number_format_fields[ $field_id ][ $column_number ]['isNumberFormat'] = $isNumberFormat;

									$isNumberRounding = strlen( $default_isNumberRounding ) > 0 ? $default_isNumberRounding : rgar( $choice, 'isNumberRounding' );
									$number_format_fields[ $field_id ][ $column_number ]['isNumberRounding'] = $isNumberRounding;

									$isNumberRoundingDirection = strlen( rgar( $choice, 'isNumberRoundingDirection' ) ) > 0 ? rgar( $choice, 'isNumberRoundingDirection' ) : 'roundclosest';
									$number_format_fields[ $field_id ][ $column_number ]['isNumberRoundingDirection'] = $isNumberRoundingDirection;

									$isNumberFixedPoint = rgar( $choice, 'isNumberFixedPoint' ) ? $field->isNumberFixedPoint : 'false';
									$number_format_fields[ $field_id ][ $column_number ]['isNumberFixedPoint'] = rgar( $choice, 'isNumberFixedPoint' );

									$isNumberColumnTotal = rgar( $choice, 'isNumberColumnTotal' ) ? 'true' : 'false';
									$number_format_fields[ $field_id ][ $column_number ]['isNumberColumnTotal'] = $isNumberColumnTotal;

									if ( ''  !== rgar( $choice, 'isNumberCalculationFormula' ) ) {
										$number_format_fields[ $field_id ][ $column_number ]['isNumberCalculationFormula'] = esc_js( rgar( $choice, 'isNumberCalculationFormula' ) );
									}

									if ( ''  !== rgar( $choice, 'isNumberRangeMin' ) ) {
										$number_format_fields[ $field_id ][ $column_number ]['isNumberRangeMinFormula'] = esc_js( rgar( $choice, 'isNumberRangeMin' ) );
									}

									if ( ''  !== rgar( $choice, 'isNumberRangeMax' ) ) {
										$number_format_fields[ $field_id ][ $column_number ]['isNumberRangeMaxFormula'] = esc_js( rgar( $choice, 'isNumberRangeMax' ) );
									}
								}
							}
						} elseif ( $field->isNumber ) {
							$column_number = 1;

							$isNumberFormat = strlen( $default_isNumberFormat ) > 0 ? $default_isNumberFormat : $field->isNumberFormat;
							$number_format_fields[ $field_id ][ $column_number ]['isNumberFormat'] = $isNumberFormat;

							$isNumberRounding = strlen( $default_isNumberRounding ) > 0 ? $default_isNumberRounding : $field->isNumberRounding;
							$number_format_fields[ $field_id ][ $column_number ]['isNumberRounding'] = $isNumberRounding;

							$isNumberRoundingDirection = strlen( $field->isNumberRoundingDirection ) > 0 ? $field->isNumberRoundingDirection : 'roundclosest';
							$number_format_fields[ $field_id ][ $column_number ]['isNumberRoundingDirection'] = $isNumberRoundingDirection;

							$isNumberFixedPoint = $field->isNumberFixedPoint > 0 ? $field->isNumberFixedPoint : 'false';
							$number_format_fields[ $field_id ][ $column_number ]['isNumberFixedPoint'] = $isNumberFixedPoint;

							$isNumberColumnTotal = $field->isNumberColumnTotal ? 'true' : 'false';
							$number_format_fields[ $field_id ][ $column_number ]['isNumberColumnTotal'] = $isNumberColumnTotal;
						}
					}
				}
			}

			$settings_array = array(
				'form_id' => $form['id'],
				'text_cannot_be_less_than' => esc_js( __( 'Cannot be less than', 'list-field-number-format-for-gravity-forms' ) ),
				'text_cannot_be_more_than' => esc_js( __( 'Cannot be more than', 'list-field-number-format-for-gravity-forms' ) ),
				'is_entry_detail' => $is_entry_detail ? $is_entry_detail : 0,
				'number_format_fields' => $number_format_fields,
			);

			wp_localize_script( 'itsg_gf_listnumformat_js', 'itsg_gf_listnumformat_js_settings', $settings_array );

		} // END localize_scripts

		public function localize_scripts_admin( $form, $is_ajax ) {
			$settings_array = array(
				'text_number_format' => esc_js( __( 'Number Format', 'list-field-number-format-for-gravity-forms' ) ),
				'text_enable_number_format' => esc_js( __( 'Enable Number Format', 'list-field-number-format-for-gravity-forms' ) ),
				'text_currency' => esc_js( __( 'Currency', 'list-field-number-format-for-gravity-forms' ) ),
				'text_rounding_direction' => esc_js( __( 'Rounding Direction', 'list-field-number-format-for-gravity-forms' ) ),
				'text_do_not_round' => esc_js( __( 'Do not round', 'list-field-number-format-for-gravity-forms' ) ),
				'text_rounding' => esc_js( __( 'Rounding', 'list-field-number-format-for-gravity-forms' ) ),
				'text_range' => esc_js( __( 'Range', 'list-field-number-format-for-gravity-forms' ) ),
				'text_min' => esc_js( __( 'Min', 'list-field-number-format-for-gravity-forms' ) ),
				'text_max' => esc_js( __( 'Max', 'list-field-number-format-for-gravity-forms' ) ),
				'text_format_currency' => '$9,999.00',
				'text_format_decimal_dot' => '9,999.99',
				'text_format_decimal_comma' => '9.999,99',
				'text_fixed_point' => esc_js( __( 'Fixed point notation', 'list-field-number-format-for-gravity-forms' ) ),
				'text_enable_calculation' => esc_js( __( 'Enable Calculation', 'list-field-number-format-for-gravity-forms' ) ),
				'text_enable_range_calculation' => esc_js( __( 'Enable Range Calculation', 'list-field-number-format-for-gravity-forms' ) ),
				'text_enable_range_instructions' => esc_js( __( 'Enable Range Instructions', 'list-field-number-format-for-gravity-forms' ) ),
				'text_enable_column_total' => esc_js( __( 'Enable Column Total', 'list-field-number-format-for-gravity-forms' ) ),
				'text_min_formula' => esc_js( __( 'Min Formula', 'list-field-number-format-for-gravity-forms' ) ),
				'text_max_formula' => esc_js( __( 'Max Formula', 'list-field-number-format-for-gravity-forms' ) ),
				'text_column_row_value' => esc_js( __( 'Column row value', 'list-field-number-format-for-gravity-forms' ) ),
			);

			wp_localize_script( 'itsg_gf_listnumformat_admin_js', 'itsg_gf_listnumformat_admin_js_settings', $settings_array );
		} // END localize_scripts_admin

		/*
          * Adds custom sortable setting for field
          */
        function field_settings( $position, $form_id ) {
            // Create settings on position 50 (top position)
            if ( 50 == $position ) {
				?>
				<li class='list_number_settings field_setting'>
					<label class="section_label"><?php _e( 'Number Format', 'list-field-number-format-for-gravity-forms' ); ?></label>
					<input type='checkbox' id='list_number_enable' onclick='SetFieldProperty( "isNumber", this.checked );itsg_gf_list_numformat_init();'>
					<label class='inline' for='list_number_enable'>
					<?php _e( 'Enable Number Format', 'list-field-number-format-for-gravity-forms' ); ?>
					<?php gform_tooltip( 'list_number_enable' );?>
					</label>
					<div class="list_choice_number_options_single" style="display:none; background: rgb(244, 244, 244) none repeat scroll 0px 0px; padding: 10px; border-bottom: 1px solid grey; margin-top: 10px;" >
						<div style="clear: both;">
						<label for="list_choice_number_format_single" class="section_label">
						<?php _e( 'Number Format', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<select style="margin-bottom: 10px;" onchange="SetFieldProperty( 'isNumberFormat', this.value);itsg_gf_list_numformat_displayed_options( 'single' )" id="list_choice_number_format_single" >
						<option value="decimal_dot">9,999.99</option>
						<option value="decimal_comma">9.999,99</option>
						<option value="decimal_none">9999.99</option>
						<option value="currency"><?php _e( 'Currency', 'list-field-number-format-for-gravity-forms' ); ?></option>
						</select>
						<div style="clear: both;">
						<label for="list_choice_number_rounding_single" class="section_label">
						<?php _e( 'Rounding', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<select style="margin-bottom: 10px;" onchange="SetFieldProperty( 'isNumberRounding', this.value);itsg_gf_list_numformat_displayed_options( 'single' )" id="list_choice_number_rounding_single" >
						<option value="norounding"><?php _e( 'Do not round', 'list-field-number-format-for-gravity-forms' ); ?></option>
						<option value="0">0</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						</select>
						<br>
						<input type="checkbox" id="list_choice_number_fixed_point_single" onclick="SetFieldProperty( 'isNumberFixedPoint', this.checked );" >
						<label for="list_choice_number_fixed_point_single" class="inline">
						<?php _e( 'Fixed point notation', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						<br><br>
						<div style="clear: both;">
						<label for="list_choice_number_rounding_direction_single" class="section_label">
						<?php _e( 'Rounding Direction', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<select style="margin-bottom: 10px;" onchange="SetFieldProperty( 'isNumberRoundingDirection', this.value);" id="list_choice_number_rounding_direction_single" >
						<option value="roundclosest"><?php _e( 'Round closest', 'list-field-number-format-for-gravity-forms' ); ?></option>
						<option value="roundup"><?php _e( 'Round up', 'list-field-number-format-for-gravity-forms' ); ?></option>
						<option value="rounddown"><?php _e( 'Round down', 'list-field-number-format-for-gravity-forms' ); ?></option>
						</select>
						<br>
						<div style="clear: both;">
						<label class="section_label">
						<?php _e( 'Range', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<div class="range_min">
						<input type="text" onchange="SetFieldProperty( 'isNumberRangeMin', this.value);" id="list_choice_number_range_min_single" >
						<label for="list_choice_number_range_min_single">
						<?php _e( 'Min', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<div class="range_max">
						<input type="text" onchange="SetFieldProperty( 'isNumberRangeMax', this.value);" id="list_choice_number_range_max_single" >
						<label for="list_choice_number_range_max_single">
						<?php _e( 'Max', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						</div>
						<br>
						<input type="checkbox" id="list_choice_number_range_instructions_single" onclick="SetFieldProperty( 'isNumberRangeInstructions', this.checked );" >
						<label for="list_choice_number_range_instructions_single" class="inline">
						<?php _e( 'Enable Range Instructions', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						<br><br>
						<input type="checkbox" id="list_choice_number_column_total_single" onclick="SetFieldProperty( 'isNumberColumnTotal', this.checked );" >
						<label for="list_choice_number_column_total_single" class="inline">
						<?php _e( 'Enable Column Total', 'list-field-number-format-for-gravity-forms' ); ?>
						</label>
						<br><br>
					</div>
				</li>
			<?php
            }
        } // END field_settings

		/*
         * Tooltip
         */
		function field_tooltip( $tooltips ) {
			$tooltips['list_number_enable'] = "<h6>". __( 'Number Format', 'list-field-number-format-for-gravity-forms' )."</h6>". __( 'Select this option to set column as a number format field.', 'list-field-number-format-for-gravity-forms' );
			return $tooltips;
		} // END field_tooltip

		/*
         * Changes column field
         */
		function change_column_content( $input, $input_info, $field, $text, $value, $form_id ) {
			if ( GFCommon::is_form_editor() ) {
				$has_columns = is_array( $field->choices );
				if ( $has_columns ) {
					foreach( $field->choices as $choice ) {
						if ( $text == rgar( $choice, 'text' ) && rgar( $choice, 'isNumber' ) ) {
							$isNumberFormat = rgar( $choice, 'isNumberFormat' );
							$isNumberRounding = rgar( $choice, 'isNumberRounding' );
							$isNumberFixedPoint = rgar( $choice, 'isNumberFixedPoint' );
							$number_format_text = $this->get_formatted_value( '9999', $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
							$input = str_replace( "value='' ", "value='{$number_format_text}' ", $input );
						}
					}
				} else {
					if ( $field->isNumber ) {
						$isNumberFormat = $field->isNumberFormat;
						$isNumberRounding = $field->isNumberRounding;
						$isNumberFixedPoint = $field->isNumberFixedPoint;
						$number_format_text = $this->get_formatted_value( '9999', $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
						$input = str_replace( "value='' ", "value='{$number_format_text}' ", $input );
					}
				}
			} else {
				$field_id = $field->id;
				$has_columns = is_array( $field->choices );
				if ( $has_columns ) {
					$number_of_columns = sizeof( $field->choices );
					foreach( $field->choices as $choice ) {
						if ( $text == rgar( $choice, 'text' )  && rgar( $choice, 'isNumber' ) ) {
							// add class to input
							$isNumberFormat = rgar( $choice, 'isNumberFormat' );
							$classes = empty( $isNumberFormat ) ? 'decimal_dot' : $isNumberFormat;
							$classes .= rgar( $choice, 'isNumberColumnTotal' ) ? ' isNumberColumnTotal' : '';

							$readonly = rgar( $choice, 'isNumberEnableCalculation' ) && '' !== rgar( $choice, 'isNumberCalculationFormula' ) ? "readonly='readonly'" : '';

							$input = str_replace( "<input ", "<input {$readonly} class='{$classes}' ", $input );

							$isNumberRangeMin = rgar( $choice, 'isNumberRangeMin' );
							$isNumberRangeMax = rgar( $choice, 'isNumberRangeMax' );
							$isNumberRangeInstructions = false != rgar( $choice, 'isNumberRangeInstructions' );
							if ( $isNumberRangeInstructions && ( is_numeric( $isNumberRangeMin ) || is_numeric( $isNumberRangeMax ) ) ) {
								// add instructions
								$message = $this->get_input_range_message( $isNumberRangeMin, $isNumberRangeMax);
								$input =  $input . '<div class="instruction ">' . $message . "</div>";
							}
						}
					}
				} else {
					if ( $field->isNumber ) {
						// add class to input
						$isNumberFormat = $field->isNumberFormat;
						$classes = empty( $isNumberFormat ) ? 'decimal_dot' : $isNumberFormat;
						$classes .= $field->isNumberColumnTotal ? ' isNumberColumnTotal' : '';

						$readonly = $field->isNumberEnableCalculation && '' !== $field->isNumberCalculationFormula ? "readonly='readonly'" : '';

						$input = str_replace( "<input ", "<input class='{$classes}' ", $input );

						$isNumberRangeMin = $field->isNumberRangeMin;
						$isNumberRangeMax = $field->isNumberRangeMax;
						$isNumberRangeInstructions = false != $field->isNumberRangeInstructions;
						if ( $isNumberRangeInstructions && ( is_numeric( $isNumberRangeMin ) || is_numeric( $isNumberRangeMax ) ) ) {
							$message = $this->get_input_range_message( $isNumberRangeMin, $isNumberRangeMax);
							$input =  $input . '<div class="instruction ">' . $message . "</div>";
						}
					}
				}
			}
			return $input;
		} // change_column_content

		/*
		 * Handles custom validation for range
		 */
		function validate_number_values( $validation_result ) {
			$form = $validation_result['form'];
			if ( self::form_has_list_number_field( $form ) ) {
				$current_page = rgpost( 'gform_source_page_number_' . $form['id'] ) ? rgpost( 'gform_source_page_number_' . $form['id'] ) : 1;
				foreach( $form['fields'] as &$field )  {
					$field_page = $field->pageNumber;
					$is_hidden = RGFormsModel::is_field_hidden( $form, $field, array() );
					if ( $field_page != $current_page || $is_hidden ) {
						continue;
					}
					$has_columns = is_array( $field->choices );
					if ( $has_columns ) {
						$number_of_columns = sizeof( $field->choices );
						$list_values = maybe_unserialize( RGFormsModel::get_field_value( $field ) );  // get the value of the field);
						if ( is_array( $list_values ) ) {
							foreach ( $list_values as $row ) { // get each row
								foreach ( $field->choices as $key => &$choice ) { // for each column
									$column = rgars( $field->choices, "{$key}/text" ); // we'll be using the column label as the key
									if ( rgar( $choice, 'isNumber' ) )  {
										$value = $row[ $column ];
										$isNumberFormat = rgar( $choice, 'isNumberFormat' );
										$isNumberRounding = rgar( $choice, 'isNumberRounding' );
										$isNumberFixedPoint = rgar( $choice, 'isNumberFixedPoint' );
										$isNumberRangeMin = rgar( $choice, 'isNumberRangeMin' );
										$isNumberRangeMax = rgar( $choice, 'isNumberRangeMax' );
										if ( ! empty( $value ) ) {

											// check number is in correct format
											if ( ! $this->is_column_value_valid_format( $value, $isNumberFormat ) ) {
												$validation_result['is_valid'] = false; // set the form validation to false
												$field->failed_validation = true;

												$number_format_text = $this->get_formatted_value( '9999', $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );

												$message = sprintf( esc_html__( "The column '%s' requires a value in %s format.", 'list-field-number-format-for-gravity-forms' ), $choice['text'], $number_format_text );
												$field->validation_message = $message;
												break;
											}

											$is_valid_number = $this->is_valid_number( $value, $isNumberFormat, $isNumberRangeMin, $isNumberRangeMax, $form, $field, $row );

											// check number is in correct range
											if ( ! $is_valid_number['result'] ) {
												$validation_result['is_valid'] = false; // set the form validation to false
												$field->failed_validation = true;
												$message = $this->get_column_validation_range_message( $choice['text'], $is_valid_number['result_min'], $is_valid_number['result_max'], $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
												$field->validation_message = $message;
											}
										}
									}
								}
							}
						}
					} elseif ( $field->isNumber ) {
						$value = rgpost( "input_{$field['id']}" );
						if ( is_array( $value ) ) {
							foreach( $value as $key => $column_value ) {
								$value = $column_value;
								$row = null;
								if ( ! empty( $value ) ) {
									$isNumberFormat = $field->isNumberFormat;
									$isNumberRounding = $field->isNumberRounding;
									$isNumberFixedPoint = $field->isNumberFixedPoint;
									$isNumberRangeMin = $field->isNumberRangeMin;
									$isNumberRangeMax = $field->isNumberRangeMax;
									// check number is in correct format
									if ( ! $this->is_column_value_valid_format( $value, $isNumberFormat ) ) {
										$validation_result['is_valid'] = false; // set the form validation to false
										$field->failed_validation = true;

										$number_format_text = $this->get_formatted_value( '9999', $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );

										$message = sprintf( esc_html__( "Requires a value in %s format.", 'list-field-number-format-for-gravity-forms' ), $number_format_text );
										$field->validation_message = $message;
										break;
									}

									$is_valid_number = $this->is_valid_number( $value, $isNumberFormat, $isNumberRangeMin, $isNumberRangeMax, $form, $field, $row );

									// check number is in correct range
									if ( ! $is_valid_number['result'] ) {
										$validation_result['is_valid'] = false; // set the form validation to false
										$field->failed_validation = true;
										$message = $this->get_validation_range_message( $is_valid_number['result_min'], $is_valid_number['result_max'], $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
										$field->validation_message = $message;
									}
								}
							}
						}
					}
				}
			}
			//Assign modified $form object back to the validation result
			$validation_result['form'] = $form;
			return $validation_result;
		} // END validate_number_values

		function list_row_calculation_merge_tags( $merge_tags, $form_id, $fields, $element_id ) {

			// check the type of merge tag dropdown
			if ( 'field_calculation_formula' != $element_id ) {
				return $merge_tags;
			}

			foreach ( $fields as $field ) {

				// check the field type as we only want to generate merge tags for list fields
				if ( 'list' != $field->get_input_type() ) {
					continue;
				}

				$label = $field->label;
				$tag = '{' . $label . ':' . $field->id;
				$column_count = count( $field->choices );

				if ( $column_count > 1 ) {

					$i = 0;

					foreach ( $field->choices as $column ) {
						$merge_tags[] = array(
							'label' => $label . ' - ' . $column['text'] . ' (' . __( 'Column row value', 'list-field-number-format-for-gravity-forms' ) . ')',
							'tag'   => $tag . '.' . ++ $i . '}'
						);
					}
				}
			}

			return $merge_tags;
		} // END list_row_calculation_merge_tags

		function list_column_display_total( $value, $entry, $field ) {

			if ( $value ) {
				$is_entry_detail = GFCommon::is_entry_detail();
				if ( !( $is_entry_detail && 'edit' == rgpost( 'screen_mode' ) ) && is_object( $field ) && 'list' == $field->type ) {
					if ( $field->gravityflow_is_editable ) {
						return $value;
					}
					$has_columns = is_array( $field->choices );
					$values = unserialize( $value );
						if ( ! empty( $values ) ) {
							$total_row = array(); // we'll be storing the total row as an array here
							$form_id = $entry['form_id'];
							foreach ( $values as &$val ) {
								if ( $has_columns ) {
									$number_of_columns = sizeof( $field->choices );
									$column_number = 0;
									foreach ( $val as &$column ) {
										if ( ! isset ( $column_total[ $column_number ] ) ) {
											$column_total[ $column_number ] = 0;
										}

										if ( rgar( $field['choices'][ $column_number ], 'isNumberColumnTotal' ) ) {
											$number_format = rgar( $field['choices'][ $column_number ], 'isNumberFormat' );
											$column_total[ $column_number ] += $this->get_clean_value( $column, $number_format );
										}

										if ( $column_number >= ( $number_of_columns - 1 ) ) {
											$column_number = 0; // reset column number
										} else {
											$column_number = $column_number + 1; // increment column number
										}
									}
								} else {
									if ( ! isset ( $column_total ) ) {
										$column_total = 0;
									}

									if ( $field->isNumberColumnTotal ) {
										$number_format = $field->isNumberFormat;
										$column_total += $this->get_clean_value( $val, $number_format );
									}
								}
							}

							if ( $has_columns ) {
								foreach ( $column_total as $key => $total ) {
									if ( rgar( $field['choices'][ $key ], 'isNumber' ) && rgar( $field['choices'][ $key ], 'isNumberColumnTotal' ) ) { // isNumber and IsNumberColumnTotal
										$isNumberFormat = rgar( $field['choices'][ $key ], 'isNumberFormat' );
										$isNumberRounding = rgar( $field['choices'][ $key ], 'isNumberRounding' );
										$isNumberFixedPoint = rgar( $field['choices'][ $key ], 'isNumberFixedPoint' );
										$number_format_text = $this->get_formatted_value( $total, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
										$column_label = rgars( $field->choices, "{$key}/text" ); // we'll be using the column label as the key
										$total_row[ $column_label ] = "<div style='border-top: medium double; border-bottom: 1px solid;'><strong>{$number_format_text}</strong></div>";
									}
								}
							} else {
								if ( $field->isNumber && $field->isNumberColumnTotal ) { // isNumber and IsNumberColumnTotal
									$isNumberFormat = $field->isNumberFormat;
									$isNumberRounding = $field->isNumberRounding;
									$isNumberFixedPoint = $field->isNumberFixedPoint;
									$number_format_text = $this->get_formatted_value( $column_total, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint );
									$total_row = "<div style='border-top: medium double; border-bottom: 1px solid;'><strong>{$number_format_text}</strong></div>";
								}
							}

							// only add total row if field contains a total enabled field - avoids blank total row
							if ( ! empty( $total_row  ) ) {
								array_push( $values, $total_row ); // add row to submit value array
							}

						}
					$value = serialize( $values );
				}

			}
			return $value;
		} // END list_column_display_total

		function list_row_calculation( $form ) {
			if ( is_array( $form ) || is_object( $form ) ) {
				foreach ( $form['fields'] as $field ) {  // for all form fields
					if ( 'list' == $field->get_input_type() ) {
						$has_columns = is_array( $field->choices );
						if ( $has_columns ) { // row calculations only apply to multi-column list fields
							$list_values = maybe_unserialize( RGFormsModel::get_field_value( $field ) );  // get the value of the field
							$submit_value = array(); // we'll be storing the submit value as an array for passing via POST
							foreach ( $list_values as $row ) { // get each row
								foreach ( $field->choices as $key => $choice ) { // for each column
									$column = rgars( $field->choices, "{$key}/text" ); // we'll be using the column label as the key
									$isNumber = rgar( $choice, 'isNumber' );
									$isNumberEnableCalculation = rgar( $choice, 'isNumberEnableCalculation' );
									$isNumberCalculationFormula = trim ( rgar( $choice, 'isNumberCalculationFormula' ) );
									if ( $isNumber && $isNumberEnableCalculation && ! is_null ( $isNumberCalculationFormula ) ) {
										$isNumberFormat = rgar( $choice, 'isNumberFormat' );
										$isNumberRounding = rgar( $choice, 'isNumberRounding' );
										$isNumberFixedPoint = rgar( $choice, 'isNumberFixedPoint' );

										$result = $this->get_row_formula_result( $isNumberCalculationFormula, $form, $field, $row ); // evaluate formula and return result

										$row[ $column ] = $this->get_formatted_value( $result, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint ); // store result in the row value
									}
									array_push( $submit_value, $row[ $column ] ); // add row to submit value array
								}
							}
							$field_id = $field->id;
							$_POST['input_' . $field_id] = $submit_value; // update post with new submit value
						}
					}
				}
			}
			return $form;
		} // END list_row_calculation

        function get_formatted_value( $value, $number_format, $rounding, $isNumberFixedPoint ) {
            if ( 'currency' == $number_format ) {
                $currency = new RGCurrency( GFCommon::get_currency() );
                $value = $currency->to_money( $value );
            } else {

                $value = GFCommon::format_number( $value, $number_format );
                $value = GFCommon::round_number( $value, $rounding );
//
//                if ( ! $rounding || is_string ( $rounding ) ) {
//                    $rounding = 0;
//                }

                if ( $number_format == 'decimal_comma' ) {
                    $dec_point = ',';
                    $thousands_sep = '.';
                } else if ( $number_format == 'decimal_none' ) {
                    $dec_point = '.';
                    $thousands_sep = '';
                } else {
                    $dec_point = '.';
                    $thousands_sep = ',';
                }

                $value = number_format( $value, $rounding, $dec_point, $thousands_sep );

            }
            return $value;
        } // END get_formatted_value

		// check is value provided is value, compared to number format and min/max range - used in validation
		function is_valid_number( $value, $number_format, $isNumberRangeMin, $isNumberRangeMax, $form, $field, $row ) {
			$is_valid_number = array(); // we'll be returning the result along with evaluated range details as an array
			$is_valid_number['result'] = true;
			$is_valid_number['result_min'] = null;
			$is_valid_number['result_max'] = null;

			$isNumberRangeMin = trim( $isNumberRangeMin );
			$isNumberRangeMax = trim( $isNumberRangeMax );

			$value = $this->get_clean_value( $value, $number_format );

			$value = GFCommon::maybe_add_leading_zero( $value );

			if ( ! GFCommon::is_numeric( $value, 'decimal_dot' ) ) { // note: this is the clean value - which is always decimal_dot
				$is_valid_number['result'] = false;
				return $is_valid_number;
			}


			if ( ( is_numeric( $isNumberRangeMin ) && $value < $isNumberRangeMin ) ||
				 ( is_numeric( $isNumberRangeMax ) && $value > $isNumberRangeMax ) ) {

				$is_valid_number['result'] = false;
				$is_valid_number['result_min'] = $isNumberRangeMin;
				$is_valid_number['result_max'] = $isNumberRangeMax;

			} else {
				if ( ! is_null( $isNumberRangeMin ) && '' !== $isNumberRangeMin ) {

						$result = $this->get_row_formula_result( $isNumberRangeMin, $form, $field, $row );

						if ( GFCommon::is_numeric( $result, 'decimal_dot' ) && $value < $result ) {

							$is_valid_number['result'] = false;
							$is_valid_number['result_min'] = $result;

						}
				}

				if ( ! is_null( $isNumberRangeMax ) && '' !== $isNumberRangeMax ) {

						$result = $this->get_row_formula_result( $isNumberRangeMax, $form, $field, $row );

						if ( GFCommon::is_numeric( $result, 'decimal_dot' ) && $value > $result ) {

							$is_valid_number['result'] = false;
							$is_valid_number['result_max'] = $result;

						}
				}
			}

			return $is_valid_number;

		} // END is_valid_number

		function get_row_formula_result( $formula, $form, $field, $row ) {
			// replace multiple spaces and new lines with single space
			$formula = trim( preg_replace( '/\s+/', ' ', $formula ) );

			// get field matches out of formula
			preg_match_all( '/{[^{]*?:(\d+)\.?(\d+)?}/mi', $formula, $matches, PREG_SET_ORDER );

			if ( is_array( $matches ) ) {

				foreach ( $matches as $match ) {
					$field_id = $match[1];
					$field   = RGFormsModel::get_field( $form, $field_id );

					// check the field type as we only want the rest of the function to run if the field type is list
					if ( 'list' != $field->get_input_type() ) {
						$match_field =  $_POST['input_' . $field_id];
					} else {

						$column_number = $match[2];
						$column_number_key = $column_number - 1;

						$column_title = rgars( $field->choices, "{$column_number_key}/text" );
						$match_field =  $row[ $column_title ];
					}

					$match_value = GFCommon::to_number( $match_field ); //value from total column
						if ( ! $match_value ) {
							$match_value = 0;
						}

					$formula = str_replace( $match[0], $match_value, $formula ); // replace field with value

				}

				// check that formula is valid expression, e.g. 1 + 2 ( 3 + 4 )
				if( preg_match( '/^[0-9 -\/*\(\)]+$/', $formula ) ) {
					$result = eval( "return {$formula};" );
					return $result;
				} else {
					return false;
				}
			}
		}

		// get range message - used below each input if a min and/or max has been specified for the column
		function get_input_range_message( $isNumberRangeMin, $isNumberRangeMax ) {
			$message = '';

			if ( is_numeric( $isNumberRangeMin ) && is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( 'Please enter a value between %s and %s.', 'list-field-number-format-for-gravity-forms' ), "<strong>{$isNumberRangeMin}</strong>", "<strong>{$isNumberRangeMax}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMin ) ) {
				$message = sprintf( esc_html__( 'Please enter a value greater than or equal to %s.', 'list-field-number-format-for-gravity-forms' ), "<strong>{$isNumberRangeMin}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( 'Please enter a value less than or equal to %s.', 'list-field-number-format-for-gravity-forms' ), "<strong>{$isNumberRangeMax}</strong>" );
			}

			return $message;
		} // END get_input_range_message

		// create validation message for single-column list field
		function get_validation_range_message( $isNumberRangeMin, $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint ) {
			$message = '';

			if ( is_numeric( $isNumberRangeMin ) && is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( "Requires a value between %s and %s.", 'list-field-number-format-for-gravity-forms' ), "<strong>{$this->get_formatted_value( $isNumberRangeMin, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>", "<strong>{$this->get_formatted_value( $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMin ) ) {
				$message = sprintf( esc_html__( "Requires a value greater than or equal to %s.", 'list-field-number-format-for-gravity-forms' ), "<strong>{$this->get_formatted_value( $isNumberRangeMin, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( "Requires a value less than or equal to %s.", 'list-field-number-format-for-gravity-forms' ), "<strong>{$this->get_formatted_value( $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} else {
				$message = esc_html__( 'Requires a valid number.', 'list-field-number-format-for-gravity-forms' );
			}

			return $message;
		} // END get_validation_range_message

		// create validation message for multi-column list field
		function get_column_validation_range_message( $column_title = '', $isNumberRangeMin, $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint ) {
			$message = '';

			if ( is_numeric( $isNumberRangeMin ) && is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( "The column '%s' requires a value between %s and %s.", 'list-field-number-format-for-gravity-forms' ), $column_title, "<strong>{$this->get_formatted_value( $isNumberRangeMin, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>", "<strong>{$this->get_formatted_value( $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMin ) ) {
				$message = sprintf( esc_html__( "The column '%s' requires a value greater than or equal to %s.", 'list-field-number-format-for-gravity-forms' ), $column_title, "<strong>{$this->get_formatted_value( $isNumberRangeMin, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} elseif ( is_numeric( $isNumberRangeMax ) ) {
				$message = sprintf( esc_html__( "The column '%s' requires a value less than or equal to %s.", 'list-field-number-format-for-gravity-forms' ), $column_title, "<strong>{$this->get_formatted_value( $isNumberRangeMax, $isNumberFormat, $isNumberRounding, $isNumberFixedPoint )}</strong>" );
			} else {
				$message = sprintf( esc_html__( "The column '%s' requires a valid number.", 'list-field-number-format-for-gravity-forms' ), $column_title );
			}

			return $message;
		} // END get_column_validation_range_message

		// converts formatted number to standard number
		function get_clean_value( $value, $number_format ) {
			$value = trim( $value );
			if ( 'currency' == $number_format ) {
				$currency = new RGCurrency( GFCommon::get_currency() );
				$value    = $currency->to_number( $value );
			} else {
				$value = GFCommon::clean_number( $value, $number_format );
			}

			return ( float )$value;
		} // END get_clean_value

		// check that number provided is in the correct format - used in validation
		function is_column_value_valid_format( $value, $number_format ) {
			$value = GFCommon::maybe_add_leading_zero( $value );

			$requires_valid_number = ! rgblank( $value );

			$is_numeric = GFCommon::is_numeric( $value, $number_format );

			if ( $requires_valid_number && ! $is_numeric ) {
				return false;
			} else {
				return true;
			}
		} // END is_column_value_valid_format

		/*
         * Check if list field has a number format field
         */
		public static function form_has_list_number_field( $form ) {
			if ( ! GFCommon::is_form_editor() && is_array( $form['fields'] ) ) {
				foreach ( $form['fields'] as $field ) {
					if ( 'list' == $field->type ) {
						$has_columns = is_array( $field->choices );
						if ( $has_columns ) {
							foreach( $field->choices as $choice ) {
								if ( rgar( $choice, 'isNumber' ) )  {
									return true;
								}
							}
						} else if ( $field->isNumber ) {
							return true;
						}
					}
				}
			}
			return false;
		} // END form_has_list_number_field
    }
    new ITSG_GF_ListField_Number_Format();
}
