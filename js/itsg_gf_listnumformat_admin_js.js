// get the localised values
var text_number_format = itsg_gf_listnumformat_admin_js_settings.text_number_format;
var text_enable_number_format = itsg_gf_listnumformat_admin_js_settings.text_enable_number_format;
var text_currency = itsg_gf_listnumformat_admin_js_settings.text_currency;
var text_rounding_direction = itsg_gf_listnumformat_admin_js_settings.text_rounding_direction;
var text_do_not_round = itsg_gf_listnumformat_admin_js_settings.text_do_not_round;
var text_rounding = itsg_gf_listnumformat_admin_js_settings.text_rounding;
var text_range = itsg_gf_listnumformat_admin_js_settings.text_range;
var text_min = itsg_gf_listnumformat_admin_js_settings.text_min;
var text_max = itsg_gf_listnumformat_admin_js_settings.text_max;
var text_enable_range_instructions = itsg_gf_listnumformat_admin_js_settings.text_enable_range_instructions;
var text_format_currency = itsg_gf_listnumformat_admin_js_settings.text_format_currency;
var text_format_decimal_dot = itsg_gf_listnumformat_admin_js_settings.text_format_decimal_dot;
var text_format_decimal_comma = itsg_gf_listnumformat_admin_js_settings.text_format_decimal_comma;
var text_fixed_point = itsg_gf_listnumformat_admin_js_settings.text_fixed_point;
var text_enable_calculation = itsg_gf_listnumformat_admin_js_settings.text_enable_calculation;
var text_enable_range_calculation = itsg_gf_listnumformat_admin_js_settings.text_enable_range_calculation;
var text_enable_column_total = itsg_gf_listnumformat_admin_js_settings.text_enable_column_total;
var text_min_formula = itsg_gf_listnumformat_admin_js_settings.text_min_formula;
var text_max_formula = itsg_gf_listnumformat_admin_js_settings.text_max_formula;
var text_column_row_value = itsg_gf_listnumformat_admin_js_settings.text_column_row_value;

// ADD drop down options to list field in form editor - hooks into existing GetFieldChoices function.
(function (w){
	var GetFieldChoicesOld = w.GetFieldChoices;

	w.GetFieldChoices = function (){

		var str = GetFieldChoicesOld.apply( this, [field] );

		if( field.choices == undefined )
			return "";

		for( var index = 0; index < field.choices.length; index++ ){
			var inputType = GetInputType( field );
			var isNumber = field.choices[ index ].isNumber ? 'checked' : '';
			var isNumberFixedPoint = field.choices[ index ].isNumberFixedPoint ? 'checked' : '';
			var isNumberRangeInstructions = 'undefined' == typeof field.choices[ index ].isNumberRangeInstructions || field.choices[ index ].isNumberRangeInstructions ? 'checked' : '';
			var isNumberColumnTotal = field.choices[ index ].isNumberColumnTotal ? 'checked' : '';

			var value = field.enableChoiceValue ? String( field.choices[ index ].value ) : field.choices[ index ].text;
			if ( 'list' == inputType ){
				// first time around add a heading
				if ( 0 == index ){
					str += "<p><strong>" + text_number_format + "</strong></p>";
				}
				str += "<div>";

				// option for enable number format column
				str += "<input type='checkbox' name='choice_number_enable' id='list_choice_number_enable_" + index + "' " + isNumber + " onclick='SetFieldChoiceNumFormat( " + index + " );itsg_gf_list_numformat_init();' /> ";
				str += "<label class='inline' for='list_choice_number_enable_" + index + "'>" + value + " - " + text_enable_number_format + "</label>";
				str += "<div style='display:none; background: rgb(244, 244, 244) none repeat scroll 0px 0px; padding: 10px; border-bottom: 1px solid grey; margin: 10px 0;' class='list_choice_number_options_" + index + "'>";

				// option for number format
				str += "<div style='clear: both;'>";
				str += "<label class='section_label' for='list_choice_number_format_" + index + "'>";
				str += text_number_format + "</label>";
				str += "</div>";

				str += "<select class='choice_number_format' id='list_choice_number_format_" + index + "' onchange='SetFieldChoiceNumFormat( " + index + " );' style='margin-bottom: 10px;' >";
				str += "<option value='decimal_dot'>9,999.99</option>";
				str += "<option value='decimal_comma'>9.999,99</option>";
				str += "<option value='decimal_none'>9999.99</option>";
				str += "<option value='currency'>" + text_currency + "</option>";
				str += "</select>";

				// option for rounding to decimal places
				str += "<div style='clear: both;'>";
				str += "<label class='section_label' for='list_choice_number_rounding_" + index + "'>";
				str += text_rounding + "</label>";
				str += "</div>";

				str += "<select class='choice_number_rounding' id='list_choice_number_rounding_" + index + "' onchange='SetFieldChoiceNumFormat( " + index + " );' style='margin-bottom: 10px;' >";
				str += "<option value='norounding'>Do not round</option>";
				str += "<option value='0'>0</option>";
				str += "<option value='1'>1</option>";
				str += "<option value='2'>2</option>";
				str += "<option value='3'>3</option>";
				str += "<option value='4'>4</option>";
				str += "<option value='5'>5</option>";
				str += "</select>";

				// option for fixed point notation
				str += "<br>";
				str += "<input type='checkbox' id='list_choice_number_fixed_point_" + index + "' " + isNumberFixedPoint + " onclick='SetFieldChoiceNumFormat( " + index + " );' /> ";
				str += "<label class='inline' for='list_choice_number_fixed_point_" + index + "'>" + text_fixed_point + "</label>";
				str += "<br>";
				str += "<br>";

				// option for rounding direction
				str += "<div style='clear: both;'>";
				str += "<label class='section_label' for='list_choice_number_rounding_direction_" + index + "'>";
				str += text_rounding_direction + "</label>";
				str += "</div>";

				str += "<select class='choice_number_rounding_direction' id='list_choice_number_rounding_direction_" + index + "' onchange='SetFieldChoiceNumFormat( " + index + " ); itsg_gf_list_numformat_init();' style='margin-bottom: 10px;' >";
				str += "<option value='roundclosest'>Round closest</option>";
				str += "<option value='roundup'>Round up</option>";
				str += "<option value='rounddown'>Round down</option>";
				str += "</select>";
				str += "<br>";

				// options for range
				str += "<div style='clear: both;'>";
				str += "<label class='section_label'>" + text_range + "</label>";
				str += "</div>";

				// option for min range
				str += "<div class='range'>";
				str += "<div class='range_min'>";
				str += "<input type='text' id='list_choice_number_range_min_" + index + "' onchange='SetFieldChoiceNumFormat( " + index + " );' >";
				str += "<label for='list_choice_number_range_min_" + index + "'>";
				str +=  text_min + "</label>";
				str += "</div>";

				// option for max range
				str += "<div class='range_max'>";
				str += "<input type='text' id='list_choice_number_range_max_" + index + "' onchange='SetFieldChoiceNumFormat( " + index + " );' >";
				str += "<label for='list_choice_number_range_max_" + index + "'>";
				str +=  text_max + "</label>";
				str += "</div>";
				str += "<br>";
				str += "</div>";

				// option to include range message - enabled by default
				str += "<br>";
				str += "<input type='checkbox' id='list_choice_number_range_instructions_" + index + "' " + isNumberRangeInstructions + " onclick='SetFieldChoiceNumFormat( " + index + " );' >";
				str += "<label type='checkbox' class='inline' for='list_choice_number_range_instructions_" + index + "'>" + text_enable_range_instructions + "</label>";
				str += "<br>";

				// option to create column total
				str += "<br>";
				str += "<input type='checkbox' id='list_choice_number_column_total_" + index + "' " + isNumberColumnTotal + " onclick='SetFieldChoiceNumFormat( " + index + " );' >";
				str += "<label type='checkbox' class='inline' for='list_choice_number_column_total_" + index + "'>" + text_enable_column_total + "</label>";
				str += "<br>";

				str += "</div>";
				str += "</div>";
			}
		}

		itsg_gf_list_numformat_init();

		return str;
	}
})(window || {});

// save field options to field object
function SetFieldChoiceNumFormat( index ) {
	var isNumber = jQuery( '#list_choice_number_enable_' + index ).is( ':checked' );
	var isNumberFormat = jQuery( '#list_choice_number_format_' + index ).val();
	var isNumberRounding = jQuery( '#list_choice_number_rounding_' + index ).val();
	var isNumberFixedPoint = jQuery( '#list_choice_number_fixed_point_' + index ).is( ':checked' );
	var isNumberRoundingDirection = jQuery( '#list_choice_number_rounding_direction_' + index ).val();
	var isNumberRangeMin = jQuery( '#list_choice_number_range_min_' + index ).val();
	var isNumberRangeMax = jQuery( '#list_choice_number_range_max_' + index ).val();
	var isNumberRangeInstructions = jQuery( '#list_choice_number_range_instructions_' + index ).is( ':checked' );
	var isNumberEnableCalculation = jQuery( '#list_choice_number_enable_calculation_' + index ).is( ':checked' );
	var isNumberEnableRangeCalculation = jQuery( '#list_choice_number_enable_range_calculation_' + index ).is( ':checked' );
	var isNumberColumnTotal = jQuery( '#list_choice_number_column_total_' + index ).is( ':checked' );

	field = GetSelectedField();

	// set field selections
	field.choices[ index ].isNumber = isNumber;
	field.choices[ index ].isNumberFormat = isNumberFormat;
	field.choices[ index ].isNumberRounding = isNumberRounding;
	field.choices[ index ].isNumberFixedPoint = isNumberFixedPoint;
	field.choices[ index ].isNumberRoundingDirection = isNumberRoundingDirection;
	field.choices[ index ].isNumberRangeMin = isNumberRangeMin;
	field.choices[ index ].isNumberRangeMax = isNumberRangeMax;
	field.choices[ index ].isNumberRangeInstructions = isNumberRangeInstructions;
	field.choices[ index ].isNumberEnableCalculation = isNumberEnableCalculation;
	field.choices[ index ].isNumberColumnTotal = isNumberColumnTotal;
	field.choices[ index ].isNumberEnableRangeCalculation = isNumberEnableRangeCalculation;

	jQuery( '#list_choice_range_min_calculation_formula_' + index ).val( isNumberRangeMin );

	jQuery( '#list_choice_range_max_calculation_formula_' + index ).val( isNumberRangeMax );

	LoadBulkChoices( field );

	UpdateFieldChoices( GetInputType( field ) );

	itsg_gf_list_numformat_format_preview();

	itsg_gf_list_numformat_displayed_options( index );
}

// format the field preview inputs for multi-column list field
function itsg_gf_list_numformat_format_preview() {
	for( var index = 0; index < field.choices.length; index++ ) {
		var isNumber = jQuery( '#list_choice_number_enable_' + index ).is( ':checked' );
		if ( true == isNumber ) {
			var isNumberFormat = ( 'undefined' !== typeof field.choices[ index ].isNumberFormat ) ? field.choices[ index ].isNumberFormat : 'decimal_dot';
			if ( 'currency' == isNumberFormat ) {
				var number_format_text = text_format_currency;
			} else if ( 'decimal_comma' == isNumberFormat ) {
				var number_format_text = text_format_decimal_comma;
			} else {
				var number_format_text = text_format_decimal_dot;
			}
			var new_input = '<input type="text" disabled="disabled" value="' + number_format_text + '">';
			var column = index + 1;
			jQuery( 'li#field_' + field.id + ' table.gfield_list_container tbody tr td:nth-child(' + column + ')' ).html( new_input );
		}
	}
}

// format available options
function itsg_gf_list_numformat_displayed_options( index ) {

	var rounding_select = jQuery( '#list_choice_number_rounding_' + index );
	var rounding_select_label = jQuery( 'label[for="list_choice_number_rounding_' + index + '"]' );
	var rounding_direction_select = jQuery( '#list_choice_number_rounding_direction_' + index );
	var rounding_direction_select_label = jQuery( 'label[for="list_choice_number_rounding_direction_' + index + '"]' );
	var fixed_poiont_label = jQuery( 'label[for="list_choice_number_fixed_point_' + index + '"]' );
	var fixed_poiont_input = jQuery( '#list_choice_number_fixed_point_' + index );
	var isNumberFormat = jQuery( '#list_choice_number_format_' + index ).val();
	var isNumberCalculationFormula = jQuery( '#list_choice_number_format_' + index ).val();
	var rounding_selected_option = rounding_select.find( 'option:selected' ).val();
	var isNumberEnableCalculation = jQuery( '#list_choice_number_enable_calculation_' + index ).prop( 'checked' );
	var isNumberEnableRangeCalculation = jQuery( '#list_choice_number_enable_range_calculation_' + index ).prop( 'checked' );

	if ( isNumberEnableCalculation ) {
		jQuery( '.list_choice_number_options_' + index + ' #calculation_options_' + index ).show();
	} else {
		jQuery( '.list_choice_number_options_' + index + ' #calculation_options_' + index ).hide();
	}

	if ( isNumberEnableRangeCalculation ) {
		jQuery( '.list_choice_number_options_' + index + ' #range_min_calculation_options_' + index ).show();
		jQuery( '.list_choice_number_options_' + index + ' #range_max_calculation_options_' + index ).show();

		jQuery( '.list_choice_number_options_' + index + ' .range_min' ).hide();
		jQuery( '.list_choice_number_options_' + index + ' .range_max' ).hide();

		jQuery( '#list_choice_number_range_instructions_' + index ).hide();
		jQuery( 'label[for=list_choice_number_range_instructions_' + index + ']' ).removeClass( 'inline' ).hide();
	} else {
		jQuery( '.list_choice_number_options_' + index + ' #range_min_calculation_options_' + index ).hide();
		jQuery( '.list_choice_number_options_' + index + ' #range_max_calculation_options_' + index ).hide();

		jQuery( '.list_choice_number_options_' + index + ' .range_min' ).show();
		jQuery( '.list_choice_number_options_' + index + ' .range_max' ).show();

		jQuery( '#list_choice_number_range_instructions_' + index ).show();
		jQuery( 'label[for=list_choice_number_range_instructions_' + index + ']' ).addClass( 'inline' ).show();
	}

	if ( 'currency' == isNumberFormat ) {
		// hide fixed point notation - does not apply to currency format
		fixed_poiont_label.hide();
		fixed_poiont_label.removeClass( 'inline' );
		fixed_poiont_input.hide();
		// is selected rounding option is more than 2 - select 2
		if ( rounding_selected_option > 2 || 1 == rounding_selected_option || 'norounding' == rounding_selected_option ) {
			rounding_select.val(2);
		}
		// hide options 1, >2 and 'Do not round'
		rounding_select.find( 'option' ).each( function() {
			var rounding_select_option = jQuery( this );
			var rounding_select_option_value = jQuery( this ).val();
			if ( rounding_select_option_value > 2 || 1 == rounding_select_option_value  || 'norounding' == rounding_select_option_value ) {
				rounding_select_option.hide();
			}
		});
	} else {
		if ( 'norounding' == rounding_selected_option ) {
			// hide fixed point notation - does not when no rounding
			fixed_poiont_label.hide();
			fixed_poiont_label.removeClass( 'inline' );
			fixed_poiont_input.hide();

			rounding_direction_select.hide();
			rounding_direction_select_label.hide();
		} else if ( '0' == rounding_selected_option ) {
			// hide fixed point notation - does not when rounding to integer
			fixed_poiont_label.hide();
			fixed_poiont_label.removeClass( 'inline' );
			fixed_poiont_input.hide();

			rounding_direction_select.show();
			rounding_direction_select_label.show();
			// display all options
			rounding_select.find( 'option' ).each( function() {
				jQuery( this ).show();
			});
		} else {
			// display fixed point notation
			fixed_poiont_label.show();
			fixed_poiont_label.addClass( 'inline' );
			fixed_poiont_input.show();

			rounding_direction_select.show();
			rounding_direction_select_label.show();
			// display all options
			rounding_select.find( 'option' ).each( function() {
				jQuery( this ).show();
			});
		}
	}
}

function isNumberFormulaContentCallback( index ) {
	if ( 'single' == index ) {
		calculationFormula = 'isNumberCalculationFormula';
		SetFieldProperty( calculationFormula, jQuery( '#list_choice_calculation_formula_' + index ).val().trim() );
	} else {
		var value = jQuery( '#list_choice_calculation_formula_' + index ).val().trim();
		field.choices[ index ].isNumberCalculationFormula = value;

		var value = jQuery( '#list_choice_range_min_calculation_formula_' + index ).val().trim();
		field.choices[ index ].isNumberRangeMin = value;
		jQuery( '#list_choice_number_range_min_' + index ).val( value );

		var value = jQuery( '#list_choice_range_max_calculation_formula_' + index ).val().trim();
		field.choices[ index ].isNumberRangeMax = value;
		jQuery( '#list_choice_number_range_max_' + index ).val( value );
	}
}

// handles custom options - runs on field load and when field options change
function itsg_gf_list_numformat_init() {
	setTimeout(function(){
		var field_type = field.type;
		if ( 'list' == field_type ) {
			if ( field.enableColumns ) {
				// hide single column options
				jQuery( '.list_number_settings' ).hide();

				// set up mulit-column options
				for( var index = 0; index < field.choices.length; index++ ) {
					var isNumber = field.choices[ index ].isNumber;
					if ( true == isNumber ) {
						// add calculation options
						if ( ! jQuery( '.list_choice_number_options_' + index + ' #calculation_options_' + index ).length ) {
							// create calculation input, change callback
							var new_formula_input = jQuery( '#calculation_options' ).prop('outerHTML').replace( /FormulaContentCallback/g, '' ).replace( /calculation_options/g, 'calculation_options_' + index ).replace( /field_calculation_formula/g, 'list_choice_calculation_formula_' + index ).replace( /field.calculationFormula/g, 'field.choices[' + index + '].isNumberCalculationFormula' );
							// add calculation input to end of column number options
							jQuery( '.list_choice_number_options_' + index ).append( new_formula_input );
							// remove tooltip
							jQuery( '#calculation_options_' + index + ' a.gf_tooltip' ).remove();
							// add calculation input change event for select
							jQuery( '#calculation_options_' + index + ' #list_choice_calculation_formula_' + index + '_variable_select' ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='calculation_options_']" ).attr( 'id' ).replace( 'calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for buttons
							jQuery( '#calculation_options_' + index + ' div.gf_calculation_buttons input' ).click(function() {
								var current_index = jQuery(this).parents( "div[id^='calculation_options_']" ).attr( 'id' ).replace( 'calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for typed changes to textarea
							jQuery( '#calculation_options_' + index + ' textarea#list_choice_calculation_formula_' + index ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='calculation_options_']" ).attr( 'id' ).replace( 'calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});

							// remove any unsupported options - leave only column row value options
							// remove the standard options
							//jQuery( '#list_choice_calculation_formula_' + index + '_variable_select optgroup[label="Allowable form fields"]' ).remove();
							// remove any options created by other plugins
							jQuery( 'li#field_' + field.id + ' #list_choice_calculation_formula_' + index + '_variable_select optgroup[label="Custom"]' ).find( 'option' ).each( function() {
								if ( '' !== jQuery( this ).val() && ( -1 == jQuery( this ).val().indexOf( ':' + field.id + '.' ) || -1 == jQuery( this ).text().indexOf( '(' + text_column_row_value + ')' ) ) ) {
									jQuery( this ).remove();
								}
							});

							// remove default merge tags options
							jQuery( '#calculation_options_' + index + ' #field_calculation_rounding' ).remove();
							jQuery( '#calculation_options_' + index + ' label[for="field_calculation_rounding"]' ).remove();

							// add Enable Calculation checkbox
							jQuery('<input>').attr({
								type: 'checkbox',
								id: 'list_choice_number_enable_calculation_' + index,
								onclick: 'SetFieldChoiceNumFormat( ' + index + ' )',
								checked: field.choices[ index ].isNumberEnableCalculation
							}).insertBefore('#calculation_options_' + index );

							// add Enable Calculation label
							jQuery('<label>').attr({
								type: 'checkbox',
								class: 'inline',
								for: 'list_choice_number_enable_calculation_' + index,
							}).text( text_enable_calculation ).insertBefore('#calculation_options_' + index );

							// reset height in case value has been set
							jQuery( '#calculation_options_' + index ).css( 'height', 'auto' );
							jQuery( '#calculation_options_' + index + ' textarea#list_choice_calculation_formula_' + index ).css( 'height', '80px' );
						}

						// add range min and max calculation fields
						if ( ! jQuery( '.list_choice_number_options_' + index + ' #range_min_calculation_options_' + index ).length ) {

							// MIN FORUMULA

							// create calculation input, change callback
							var new_formula_input = jQuery( '#calculation_options' ).prop('outerHTML').replace( /FormulaContentCallback/g, '' ).replace( /calculation_options/g, 'range_min_calculation_options_' + index ).replace( /field_calculation_formula/g, 'list_choice_range_min_calculation_formula_' + index ).replace( /field.calculationFormula/g, 'field.choices[' + index + '].isNumberRangeMin' );
							// add calculation input to end of column number options
							jQuery( '.list_choice_number_options_' + index + ' div.range').append( new_formula_input );
							// remove tooltip
							jQuery( '#range_min_calculation_options_' + index + ' a.gf_tooltip' ).remove();
							// change label to Min Formula
							jQuery( '#range_min_calculation_options_' + index + ' label' ).text( text_min_formula );
							// add calculation input change event for select
							jQuery( '#range_min_calculation_options_' + index + ' #list_choice_range_min_calculation_formula_' + index + '_variable_select' ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='range_min_calculation_options_']" ).attr( 'id' ).replace( 'range_min_calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for buttons
							jQuery( '#range_min_calculation_options_' + index + ' div.gf_calculation_buttons input' ).click(function() {
								var current_index = jQuery(this).parents( "div[id^='range_min_calculation_options_']" ).attr( 'id' ).replace( 'range_min_calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for typed changes to textarea
							jQuery( '#range_min_calculation_options_' + index + ' textarea#list_choice_range_min_calculation_formula_' + index ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='range_min_calculation_options_']" ).attr('id').replace('range_min_calculation_options_','');
								isNumberFormulaContentCallback ( current_index );
							});

							// remove any unsupported options - leave only column row value options
							// remove the standard options
							jQuery( '#list_choice_range_min_calculation_formula_' + index + '_variable_select optgroup[label="Allowable form fields"]' ).remove();
							// remove any options created by other plugins
							jQuery( 'li#field_' + field.id + ' #list_choice_range_min_calculation_formula_' + index + '_variable_select' ).find( 'option' ).each( function() {
							  if ( '' !== jQuery( this ).val() && ( -1 == jQuery( this ).val().indexOf( ':' + field.id + '.' ) || -1 == jQuery( this ).text().indexOf( '(' + text_column_row_value + ')' ) ) ) {
								 jQuery( this ).remove();
							  }
							});

							// remove default merge tags options
							jQuery( '#range_min_calculation_options_' + index + ' #field_calculation_rounding' ).remove();
							jQuery( '#range_min_calculation_options_' + index + ' label[for="field_calculation_rounding"]' ).remove();

							// MAX FORUMULA

							// create calculation input, change callback
							var new_formula_input = jQuery( '#calculation_options' ).prop('outerHTML').replace( /FormulaContentCallback/g, '' ).replace( /calculation_options/g, 'range_max_calculation_options_' + index ).replace( /field_calculation_formula/g, 'list_choice_range_max_calculation_formula_' + index ).replace( /field.calculationFormula/g, 'field.choices[' + index + '].isNumberRangeMax' );
							// add calculation input to end of column number options
							jQuery( '.list_choice_number_options_' + index + ' div.range').append( new_formula_input );
							// remove tooltip
							jQuery( '#range_max_calculation_options_' + index + ' a.gf_tooltip' ).remove();
							// change label to Max Formula
							jQuery( '#range_max_calculation_options_' + index + ' label' ).text( text_max_formula );
							// add calculation input change event for select
							jQuery( '#range_max_calculation_options_' + index + ' #list_choice_range_max_calculation_formula_' + index + '_variable_select' ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='range_max_calculation_options_']" ).attr( 'id' ).replace( 'range_max_calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for buttons
							jQuery( '#range_max_calculation_options_' + index + ' div.gf_calculation_buttons input' ).click(function() {
								var current_index = jQuery(this).parents( "div[id^='range_max_calculation_options_']" ).attr( 'id' ).replace( 'range_max_calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});
							// add calculation input change event for typed changes to textarea
							jQuery( '#range_max_calculation_options_' + index + ' textarea#list_choice_range_max_calculation_formula_' + index ).change(function() {
								var current_index = jQuery(this).parents( "div[id^='range_max_calculation_options_']" ).attr( 'id' ).replace( 'range_max_calculation_options_', '' );
								isNumberFormulaContentCallback ( current_index );
							});

							// remove any unsupported options - leave only column row value options
							// remove the standard options
							jQuery( '#list_choice_range_max_calculation_formula_' + index + '_variable_select optgroup[label="Allowable form fields"]' ).remove();
							// remove any options created by other plugins
							jQuery( 'li#field_' + field.id + ' #list_choice_range_max_calculation_formula_' + index + '_variable_select' ).find( 'option' ).each( function() {
							  if ( '' !== jQuery( this ).val() && ( -1 == jQuery( this ).val().indexOf( ':' + field.id + '.' ) || -1 == jQuery( this ).text().indexOf( '(' + text_column_row_value + ')' ) ) ) {
								 jQuery( this ).remove();
							  }
							});

							// remove default merge tags options
							jQuery( '#range_max_calculation_options_' + index + ' #field_calculation_rounding' ).remove();
							jQuery( '#range_max_calculation_options_' + index + ' label[for="field_calculation_rounding"]' ).remove();

							// add Enable Calculation checkbox
							jQuery('<input>').attr({
								type: 'checkbox',
								id: 'list_choice_number_enable_range_calculation_' + index,
								onclick: 'SetFieldChoiceNumFormat( ' + index + ' )',
								checked: field.choices[ index ].isNumberEnableCalculation
							}).insertBefore('#range_min_calculation_options_' + index );

							// add Enable Range Calculation label
							jQuery('<label>').attr({
								type: 'checkbox',
								class: 'inline',
								for: 'list_choice_number_enable_range_calculation_' + index,
							}).text( text_enable_range_calculation ).insertBefore('#range_min_calculation_options_' + index );

							// reset height in case value has been set
							jQuery( '#range_min_calculation_options_' + index ).css( 'height', 'auto' );
							jQuery( '#range_min_calculation_options_' + index + ' textarea#list_choice_range_max_calculation_formula_' + index ).css( 'height', '80px' );
						}

						// display options
						jQuery( '.list_choice_number_options_' + index ).show();

						// set values
						var isNumber = 'undefined' !== typeof field.choices[ index ].isNumber ? field.choices[ index ].isNumber : false;
						var isNumberFormat = 'undefined' !== typeof field.choices[ index ].isNumberFormat ? field.choices[ index ].isNumberFormat : 'decimal_dot';
						var isNumberRounding = 'undefined' !== typeof field.choices[ index ].isNumberRounding ? field.choices[ index ].isNumberRounding : 'norounding';
						var isNumberFixedPoint = 'undefined' !== typeof field.choices[ index ].isNumberFixedPoint ? field.choices[ index ].isNumberFixedPoint : false;
						var isNumberRoundingDirection = 'undefined' !== typeof field.choices[ index ].isNumberRoundingDirection ? field.choices[ index ].isNumberRoundingDirection : 'roundclosest';
						var isNumberRangeMin = 'undefined' !== typeof field.choices[ index ].isNumberRangeMin ? field.choices[ index ].isNumberRangeMin : '';
						var isNumberRangeMax = 'undefined' !== typeof field.choices[ index ].isNumberRangeMax ? field.choices[ index ].isNumberRangeMax : '';
						var isNumberEnableCalculation = 'undefined' !== typeof field.choices[ index ].isNumberEnableCalculation ? field.choices[ index ].isNumberEnableCalculation : false;
						var isNumberEnableRangeCalculation = 'undefined' !== typeof field.choices[ index ].isNumberEnableRangeCalculation ? field.choices[ index ].isNumberEnableRangeCalculation : false;
						var isNumberCalculationFormula = 'undefined' !== typeof field.choices[ index ].isNumberCalculationFormula ? field.choices[ index ].isNumberCalculationFormula : '';

						jQuery( '#field_columns #list_choice_number_enable_' + index ).prop( 'checked', isNumber );
						jQuery( '#field_columns #list_choice_number_format_' + index ).val( isNumberFormat );
						jQuery( '#field_columns #list_choice_number_rounding_' + index ).val( isNumberRounding );
						jQuery( '#field_columns #list_choice_number_fixed_point_' + index ).prop( 'checked', isNumberFixedPoint );
						jQuery( '#field_columns #list_choice_number_rounding_direction_' + index ).val( isNumberRoundingDirection );
						jQuery( '#field_columns #list_choice_number_range_min_' + index ).val( isNumberRangeMin );
						jQuery( '#field_columns #list_choice_number_range_max_' + index ).val( isNumberRangeMax );
						jQuery( '#field_columns #list_choice_number_enable_calculation_' + index ).prop( 'checked', isNumberEnableCalculation );
						jQuery( '#field_columns #list_choice_number_enable_range_calculation_' + index ).prop( 'checked', isNumberEnableRangeCalculation );
						jQuery( '#field_columns #list_choice_calculation_formula_' + index ).val( isNumberCalculationFormula );
						jQuery( '#field_columns #list_choice_range_min_calculation_formula_' + index ).val( isNumberRangeMin );
						jQuery( '#field_columns #list_choice_range_max_calculation_formula_' + index ).val( isNumberRangeMax );

						// set drop down options
						itsg_gf_list_numformat_displayed_options( index )
					}  else {
						jQuery( '.list_choice_number_options_' + index ).hide();
					}
				}
			} else {
				var index = 'single';

				// show single column options
				jQuery( '.list_number_settings' ).show();

				// set values
				var isNumber = 'undefined' !== typeof field.isNumber ? field.isNumber : false;
				var isNumberFormat = 'undefined' !== typeof field.isNumberFormat ? field.isNumberFormat : 'decimal_dot';
				var isNumberRounding = 'undefined' !== typeof field.isNumberRounding ? field.isNumberRounding : 'norounding';
				var isNumberFixedPoint = 'undefined' !== typeof field.isNumberFixedPoint ? field.isNumberFixedPoint : false;
				var isNumberRoundingDirection = 'undefined' !== typeof field.isNumberRoundingDirection ? field.isNumberRoundingDirection : 'roundclosest';
				var isNumberRangeMin = 'undefined' !== typeof field.isNumberRangeMin ? field.isNumberRangeMin : '';
				var isNumberRangeMax = 'undefined' !== typeof field.isNumberRangeMax ? field.isNumberRangeMax : '';
				var isNumberRangeInstructions = 'undefined' !== typeof field.isNumberRangeInstructions ? field.isNumberRangeInstructions : true;
				var isNumberColumnTotal = 'undefined' !== typeof field.isNumberColumnTotal ? field.isNumberColumnTotal : true;

				jQuery( '#field_settings .list_number_settings #list_number_enable' ).prop( 'checked', isNumber );
				jQuery( '#field_settings .list_number_settings #list_choice_number_format_single' ).val( isNumberFormat );
				jQuery( '#field_settings .list_number_settings #list_choice_number_rounding_single' ).val( isNumberRounding );
				jQuery( '#field_settings .list_number_settings #list_choice_number_fixed_point_single' ).prop( 'checked', isNumberFixedPoint );
				jQuery( '#field_settings .list_number_settings #list_choice_number_rounding_single_direction' ).val( isNumberRoundingDirection );
				jQuery( '#field_settings .list_number_settings #list_choice_number_range_min_single' ).val( isNumberRangeMin );
				jQuery( '#field_settings .list_number_settings #list_choice_number_range_max_single' ).val( isNumberRangeMax );
				jQuery( '#field_settings .list_number_settings #list_choice_number_range_instructions_single' ).prop( 'checked', isNumberRangeInstructions );
				jQuery( '#field_settings .list_number_settings #list_choice_number_column_total_single' ).prop( 'checked', isNumberColumnTotal );

				// display options if isNumber enabled
				if ( field.isNumber ) {
					jQuery( '.list_choice_number_options_' + index ).show();

					// set drop down options
					itsg_gf_list_numformat_displayed_options( index );
				} else {
					jQuery( '.list_choice_number_options_' + index ).hide();
				}
			}
		}
	}, 50);
}

// trigger for when column titles are updated
jQuery( document ).on( 'change', '#gfield_settings_columns_container #field_columns li.field-choice-row', function() {
	itsg_gf_list_numformat_init();
});

// trigger when 'Enable multiple columns' is ticked
jQuery( document ).on('change', '#field_settings input[id=field_columns_enabled]', function() {
	itsg_gf_list_numformat_init();
});

// trigger for when field is opened
jQuery( document ).bind( 'gform_load_field_settings', function( event, field, form ) {
	itsg_gf_list_numformat_init();
	setTimeout(function(){
		if ( 'list' != field.type ) {
			jQuery( 'li#field_' + field.id + ' #field_calculation_formula_variable_select' ).find( 'option' ).each( function() {
				 if ( '' !== jQuery( this ).val() && ( -1 != jQuery( this ).text().indexOf( '(' + text_column_row_value + ')' ) ) ) {
					jQuery( this ).remove();
				}
			});
		}
	}, 50);
});