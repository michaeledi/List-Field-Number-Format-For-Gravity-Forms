function itsg_gf_list_number_format_init(){
	// setup number format fields
	var number_format_fields = itsg_gf_listnumformat_js_settings.number_format_fields;

	var form_id = itsg_gf_listnumformat_js_settings.form_id;

	for ( var key in number_format_fields ) {
		// skip loop if the property is from prototype
		if ( ! number_format_fields.hasOwnProperty( key ) ) continue;

		var obj = number_format_fields[ key ];
		for ( var prop in obj ) {
			// skip loop if the property is from prototype
			if( !obj.hasOwnProperty( prop ) ) continue;

			var field_id = key;
			var field_column = prop;
			var isNumberFormat = typeof 'undefined' !== obj[ field_column ]['isNumberFormat'] ? obj[ field_column ]['isNumberFormat'] : 'decimal_dot';
			var isNumberRounding = ( typeof 'undefined' == obj[ field_column ]['isNumberRounding'] || 'norounding' == obj[ field_column ]['isNumberRounding'] ) ? -1 : parseInt( obj[ field_column ]['isNumberRounding'] );
			var isNumberRoundingDirection = typeof 'undefined' !== obj[ field_column ]['isNumberRoundingDirection'] ? obj[ field_column ]['isNumberRoundingDirection'] : 'roundclosest';
			var isNumberFixedPoint = typeof 'undefined' !== obj[ field_column ]['isNumberFixedPoint'] ? obj[ field_column ]['isNumberFixedPoint'] : false;
			var isNumberCalculationFormula = obj[ field_column ]['isNumberCalculationFormula'];

			var field = jQuery( '.gfield_list_' + field_id + '_cell' + field_column +' input' );

			if ( ! field.length ) { // nothing found - lets look for a select instead
				var field = jQuery( '.gfield_list_' + field_id + '_cell' + field_column +' select' );
			}

			//if ( ! field.length ) var field = jQuery('#input_' + form_id + '_' + field_id);

			if ( ! field.length ) continue;
			
			var decimalSeparator = '.';
			var thousandSeparator = ',';

			if ( 'decimal_comma' == isNumberFormat ) {
				decimalSeparator = ',';
				thousandSeparator = '.';
			} else if ( 'decimal_none' == isNumberFormat ) {
				decimalSeparator = '.';
				thousandSeparator = '';
			}

			// disable autocomplete for isNumber fields
			field.attr( 'autocomplete', 'off' );

			console.log( 'list-field-number-format-for-gravity-forms :: field_id: ' + field_id + ' field_column: ' + field_column + ' isNumberFormat: ' + isNumberFormat + ' isNumberRounding: ' + isNumberRounding + ' isNumberFixedPoint: ' + isNumberFixedPoint + ' isNumberRoundingDirection: ' + isNumberRoundingDirection + ' isNumberCalculationFormula: ' + isNumberCalculationFormula );

			// setup isNumber fields

			itsg_setup_total_columns( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

			if ( typeof 'undefined' !== isNumberCalculationFormula ) {
				itsg_setup_row_calculations( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
			}

			gformInitListNumberFormatFields( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

			itsg_setup_range( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

			// on page load - run on change event to trigger range warnings
			jQuery( 'li.gfield table.gfield_list tbody tr:not(.isNumberColumnTotalRow)' ).find( field ).each( function() {
				var value = jQuery( this ).val();
				if ( isFinite ( itsg_clean_number( value ) ) ) {
					jQuery( this ).trigger( 'change' );
				}
			});
		}
	}

	// on page load - trigger change event to run calculations -- if any
	jQuery('input.isNumberColumnTotal').trigger( 'change' );
}

function itsg_setup_row_calculations( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ){
	// setup row calculations
	var obj  = itsg_gf_listnumformat_js_settings.number_format_fields[ field_id ];
	var destination_column = field_column;
	var destination_forumla = obj[ destination_column ]['isNumberCalculationFormula'];
	var row = field.parents( 'tr.gfield_list_group:not(.isNumberColumnTotalRow)' );
	// get column matches from formula
	var patt = /{[^{]*?:(\d+(\.\d+)?)(:(.*?))?}/i;
	var matches = getMatchGroups( destination_forumla, patt );

	// for each match in formula
	for( var i in matches ) {

		if( ! matches.hasOwnProperty( i ) )
			continue;

		var inputId = matches[ i ][1];
		var fieldId = parseInt( inputId );

		// if match list field column
		if ( undefined !== matches[ i ][2] ) {
			var columnId = matches[ i ][2].substr(1);
			var keyup_input = row.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' input' );
			if ( ! keyup_input.length ) { // nothing found - lets look for a select instead
				var keyup_input = row.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' select' );
			}
		} else { // otherwise must be standard field
			//var input = jQuery( '#input_' + form_id + '_' + fieldId );
			var keyup_input = jQuery( '#field_' + form_id + '_' + fieldId ).find( 'input[name="input_' + inputId + '"]' );
			if ( ! keyup_input.length ) { // nothing found - lets look for a select instead
				var keyup_input = jQuery( '#field_' + form_id + '_' + fieldId ).find( 'select[name="input_' + inputId + '"]' );
			}
		}

		// bind keyup to field
		keyup_input.bind( 'keyup', {
			destination_column : destination_column,
			matches : matches,
		}, function( event ) {
			// get fresh formula
			var destination_forumla = obj[ destination_column ]['isNumberCalculationFormula'];
			var matches = event.data.matches;

			// for each instance of the field
			jQuery( this ).each(function() {
				// test if we're working with a list field
				var this_row = jQuery( this ).parents( 'tr.gfield_list_group:not(.isNumberColumnTotalRow)' );
				// get value from field for each match
				for( var i in matches ) {

					if( ! matches.hasOwnProperty( i ) )
						continue;

					var inputId = matches[ i ][1];
					var fieldId = parseInt( inputId );

					// if list field column
					if ( undefined !== matches[ i ][2] ) {
						var columnId = matches[ i ][2].substr(1);
						if ( ! this_row.length ) { // if input is a standard field
							var target_rows = jQuery( '#field_' + form_id + '_' + fieldId ).find( 'tr.gfield_list_group:not(.isNumberColumnTotalRow)' );
							var source_input = target_rows.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' input' );
							if ( ! source_input.length ) { // nothing found - lets look for a select instead
								var source_input = target_rows.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' select' );
							}
						} else {
							var source_input = this_row.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' input' );
							if ( ! source_input.length ) { // nothing found - lets look for a select instead
								var source_input = this_row.find( '.gfield_list_' + fieldId + '_cell' + columnId + ' select' );
							}
						}
					} else { // otherwise must be standard field
						//var input = jQuery( '#input_' + form_id + '_' + fieldId );
						var source_input = jQuery( '#field_' + form_id + '_' + fieldId ).find( 'input[name="input_' + inputId + '"]' );
						if ( ! source_input.length ) { // nothing found - lets look for a select instead
							var source_input = jQuery( '#field_' + form_id + '_' + fieldId ).find( 'select[name="input_' + inputId + '"]' );
						}
					}

					// if radio field only get active radio
					if ( source_input.prop( 'type' ) == 'radio' ) {
						source_input = source_input.filter(':checked');
					}

					// get the value and clean it up
					var value = source_input.val();

					value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

					// replace match with value
					destination_forumla = destination_forumla.replace( matches[ i ][0], value );

					// check that formula is valid expression, e.g. 1 + 2 ( 3 + 4 )
					// this helps ensure we don't try to process the formula until the all the matches are replaced
					var r = new RegExp( "^[0-9 -\/*\(\)]+$" );

					if ( this_row.length ) {
						if ( r.test( destination_forumla ) ) {
							var value = itsg_format_number_field( eval( destination_forumla ), isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
							//if ( ! this_row.length ) {
								//var destination_rows = jQuery( '#field_' + form_id + '_' + field_id ).find( 'tr.gfield_list_group:not(.isNumberColumnTotalRow)' );
								//destination_rows.find( '.gfield_list_' + field_id + '_cell' + field_column + ' input' ).val( value ).trigger( 'change' );
							//	jQuery( '.gfield_list_' + field_id + '_cell' + columnId + ' input' ).trigger( 'keyup' );
							//} else {
							var destination_row = jQuery( this ).parents( 'tr.gfield_list_group:not(.isNumberColumnTotalRow)' );
							destination_row.find( '.gfield_list_' + field_id + '_cell' + field_column + ' input' ).val( value ).trigger( 'change' );
							//}
							console.log( 'formula: ' + destination_forumla );
							console.log( 'value: ' + value );
						}
					} else {
						jQuery( '.gfield_list_' + field_id + '_cell' + columnId + ' input' ).trigger( 'keyup' );
					}

				}
			});
		});
	}
}

function itsg_setup_range( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ){

	var text_cannot_be_less_than = itsg_gf_listnumformat_js_settings.text_cannot_be_less_than;
	var text_cannot_be_more_than = itsg_gf_listnumformat_js_settings.text_cannot_be_more_than;
	var obj  = itsg_gf_listnumformat_js_settings.number_format_fields[ field_id ];

	var isNumberRangeMinFormula = undefined !== obj[ field_column ]['isNumberRangeMinFormula'] ? obj[ field_column ]['isNumberRangeMinFormula'] : '';
	var isNumberRangeMaxFormula = undefined !== obj[ field_column ]['isNumberRangeMaxFormula'] ? obj[ field_column ]['isNumberRangeMaxFormula'] : '';

	if ( isNumberRangeMinFormula.length >= 1 || isNumberRangeMaxFormula.length >= 1 ) {

		var patt = /{[^{]*?:(\d+(\.\d+)?)(:(.*?))?}/i;
		range_min_error = false;

		// MIN range change event
		var isNumberRangeMinFormula_matches = getMatchGroups( isNumberRangeMinFormula, patt );

		for( var i in isNumberRangeMinFormula_matches ) {

			if( ! isNumberRangeMinFormula_matches.hasOwnProperty( i ) )
				continue;

			var columnId = isNumberRangeMinFormula_matches[i][2].substr(1);

			var isNumberRangeMinFormulaField = jQuery( '.gfield_list_' + field_id + '_cell' + columnId +' input, .gfield_list_' + field_id + '_cell' + field_column +' input' );

			if ( ! isNumberRangeMinFormulaField.length ) { // nothing found - lets look for a select instead
				var isNumberRangeMinFormulaField = jQuery( '.gfield_list_' + field_id + '_cell' + columnId +' select, .gfield_list_' + field_id + '_cell' + field_column +' select' );
			}

			isNumberRangeMinFormulaField.bind( 'change', {
				field_id : field_id,
				field_column : field_column,
				isNumberRangeMinFormula : isNumberRangeMinFormula,
				obj : obj,
				}, function( event ) {
					range_min_error = false;
					var field_id = event.data.field_id;
					var field_column = event.data.field_column;
					var row = jQuery( this ).parents( 'tr.gfield_list_group' );
					var field = row.find( '.gfield_list_' + field_id + '_cell' + field_column +' input' );

					if ( ! field.length ) { // nothing found - lets look for a select instead
						var field = row.find( '.gfield_list_' + field_id + '_cell' + field_column +' select' );
					}

					var isNumberRangeMinFormula = event.data.isNumberRangeMinFormula;
					var obj = event.data.obj;
					var value = field.val();
					var value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

					var patt = /{[^{]*?:(\d+(\.\d+)?)(:(.*?))?}/i;
					var isNumberRangeMinFormula_matches = getMatchGroups( isNumberRangeMinFormula, patt);

					for( var i in isNumberRangeMinFormula_matches ) {

						if(! isNumberRangeMinFormula_matches.hasOwnProperty(i))
							continue;

						var columnId = isNumberRangeMinFormula_matches[i][2].substr( 1 );

						var matched_field_column = row.find( '.gfield_list_' + field_id + '_cell' + columnId +' input' );
						if ( ! matched_field_column.length ) { // nothing found - lets look for a select instead
							var matched_field_column = row.find( '.gfield_list_' + field_id + '_cell' + columnId +' select' );
						}

						var value = matched_field_column.val();

						var matched_field_column_value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

						var isNumberRangeMinFormula = isNumberRangeMinFormula.replace( isNumberRangeMinFormula_matches[i][0], matched_field_column_value );

					}

					var isNumberRangeMinFormula_formatted = '';
					isNumberFormat = obj[ field_column ]['isNumberFormat'];

					isNumberRangeMinFormula_formatted = itsg_format_number_field( eval( isNumberRangeMinFormula ), isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );


					if ( eval( isNumberRangeMinFormula ) > value ) {
						range_min_error = true;
						field.addClass( 'range-error' );
						field.next( 'div.range-error' ).remove(); // remove any existing errors
						field.after( "<div class='range-error'><div class='arrow-up'></div><span class='range-error-flag'>" + text_cannot_be_less_than + " " + isNumberRangeMinFormula_formatted + "</span></div>" );
					} else {
						field.removeClass( 'range-error' );
						field.next( 'div.range-error' ).remove();
					}
				}
			);
		}

		// MAX range change event
		var isNumberRangeMaxFormula_matches = getMatchGroups( isNumberRangeMaxFormula, patt );

		for( var i in isNumberRangeMaxFormula_matches ) {

			if( ! isNumberRangeMaxFormula_matches.hasOwnProperty( i ) )
				continue;

			var columnId = isNumberRangeMaxFormula_matches[i][2].substr(1);

			var isNumberRangeMaxFormulaField = jQuery( '.gfield_list_' + field_id + '_cell' + columnId +' input, .gfield_list_' + field_id + '_cell' + field_column +' input' );

			if ( ! isNumberRangeMaxFormulaField.length ) { // nothing found - lets look for a select instead
				var isNumberRangeMaxFormulaField = jQuery( '.gfield_list_' + field_id + '_cell' + columnId +' select, .gfield_list_' + field_id + '_cell' + field_column +' select' );
			}

			isNumberRangeMaxFormulaField.bind( 'change', {
				field_id : field_id,
				field_column : field_column,
				isNumberRangeMaxFormula : isNumberRangeMaxFormula,
				obj : obj,
				}, function( event ) {
					var field_id = event.data.field_id;
					var field_column = event.data.field_column;
					var row = jQuery( this ).parents( 'tr.gfield_list_group' );
					var field = row.find( '.gfield_list_' + field_id + '_cell' + field_column +' input' );

					if ( ! field.length ) { // nothing found - lets look for a select instead
						var field = row.find( '.gfield_list_' + field_id + '_cell' + field_column +' select' );
					}

					var isNumberRangeMaxFormula = event.data.isNumberRangeMaxFormula;
					var obj = event.data.obj;

					var value = field.val();
					var value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

					var patt = /{[^{]*?:(\d+(\.\d+)?)(:(.*?))?}/i;
					var isNumberRangeMaxFormula_matches = getMatchGroups( isNumberRangeMaxFormula, patt);

					for( var i in isNumberRangeMaxFormula_matches ) {

						if(! isNumberRangeMaxFormula_matches.hasOwnProperty(i))
							continue;

						var columnId = isNumberRangeMaxFormula_matches[i][2].substr( 1 );

						var matched_field_column = row.find( '.gfield_list_' + field_id + '_cell' + columnId +' input' );

						if ( ! matched_field_column.length ) { // nothing found - lets look for a select instead
							var matched_field_column = row.find( '.gfield_list_' + field_id + '_cell' + columnId +' select' );
						}

						var matched_field_value = matched_field_column.val();
						var matched_field_column_value = itsg_clean_number( matched_field_value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

						var isNumberRangeMaxFormula = isNumberRangeMaxFormula.replace( isNumberRangeMaxFormula_matches[i][0], matched_field_column_value );

					}

					var isNumberRangeMaxFormula_formatted = '';
					isNumberFormat = obj[ field_column ]['isNumberFormat'];

					isNumberRangeMaxFormula_formatted = itsg_format_number_field( eval( isNumberRangeMaxFormula ), isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

					if ( ! range_min_error && eval( isNumberRangeMaxFormula ) < value ) {
						field.addClass( 'range-error' );
						field.next( 'div.range-error' ).remove(); // remove any existing errors
						field.after( "<div class='range-error'><div class='arrow-up'></div><span class='range-error-flag'>" + text_cannot_be_more_than + " " + isNumberRangeMaxFormula_formatted + "</span></div>" );
					} else if ( ! range_min_error ) {
						field.removeClass( 'range-error' );
						field.next( 'div.range-error' ).remove();
					}
				}
			);
		}
	}
}

function itsg_setup_total_columns( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ){

	var obj  = itsg_gf_listnumformat_js_settings.number_format_fields[ field_id ];

	var isNumberColumnTotal = typeof 'undefined' !== obj[ field_column ]['isNumberColumnTotal'] ? obj[ field_column ]['isNumberColumnTotal'] : false;
	if ( 'true' == isNumberColumnTotal ) {

		// if list field does not already have a total row
		if ( ! jQuery( '#field_' + form_id + '_' + field_id + ' div.ginput_container table tbody:last-of-type tr:last-child' ).hasClass( 'isNumberColumnTotalRow' ) ) {
			// SETUP THE TOTAL ROW AND FIELDS : clone last row - add isNumberColumnTotalRow class, remove non isNumberColumnTotal inputs and repeat icons, set remaining inputs to readonly and remove tabindex attribute
			jQuery( '#field_' + form_id + '_' + field_id + ' div.ginput_container table tbody tr:last-child' ).clone().insertAfter( '#field_' + form_id + '_' + field_id + ' div.ginput_container table tbody' ).addClass( 'isNumberColumnTotalRow' ).removeClass( 'gfield_list_group gfield_list_row_odd gfield_list_row_even' ).wrap( '<tbody>' );
			var total_row = jQuery( '#field_' + form_id + '_' + field_id + ' div.ginput_container table tbody tr.isNumberColumnTotalRow' );
			total_row.find( 'input:not(.isNumberColumnTotal), select:not(.isNumberColumnTotal), .gfield_list_icons img' ).parent().empty();
			total_row.find( 'td.gfield_list_cell' ).removeClass().addClass( 'gfield_list_cell' );
			total_row.find( 'input' ).prop( 'readonly', true ).removeAttr( 'tabindex' ).removeAttr( 'name' );
			// remove any field instructions
			total_row.find( 'input.isNumberColumnTotal' ).next( 'div.instruction' ).empty();
			// add isNumberColumnTotalRow class to table
			jQuery( '#field_' + form_id + '_' + field_id + ' div.ginput_container table' ).addClass( 'isNumberColumnTotalRow ' );
		}

		// run calculation
		calc_column_total( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
	}
}

function itsg_gf_list_number_format_newrow( new_row, row ){
	//var field_details = row.parents( 'table.gfield_list_container' ).prev( 'input' ).attr('id').split( '_' );
	//var field_id = field_details[ field_details.length - 2 ];
	//var field_id = row.parents( 'table.gfield_list_container' ).prev( 'input' ).attr('id').split( '_' ).pop().trim().replace( '[]', '');
	if ( '1' == itsg_gf_listnumformat_js_settings.is_entry_detail ) {
		var field_details = row.parents( 'table.gfield_list_container' ).parents( 'td.detail-view' ).attr( 'id' ).split( '_' );
		var field_id = field_details[ field_details.length - 1 ];
	} else {
		var field_details = row.parents( 'li.gfield' ).attr( 'id' ).split( '_' );
		var field_id = field_details[ field_details.length - 1 ];
	}
	var form_id = itsg_gf_listnumformat_js_settings.form_id;

	new_row.find( '.gfield_list_cell input.decimal_dot, .gfield_list_cell input.decimal_comma, .gfield_list_cell input.decimal_none, .gfield_list_cell input.currency' ).each(function() {
		var field = jQuery( this );
		var field_column = field.parent( 'td.gfield_list_cell' ).index() + 1;
		var number_format_fields = itsg_gf_listnumformat_js_settings.number_format_fields;
		//var isNumberFormat = number_format_fields[ field_id ][ field_column ].isNumberFormat;
		var isNumberFormat = typeof 'undefined' !== number_format_fields[ field_id ][ field_column ]['isNumberFormat'] ? number_format_fields[ field_id ][ field_column ]['isNumberFormat'] : 'decimal_dot';
		//var isNumberRounding = number_format_fields[ field_id ][ field_column ].isNumberRounding;
		var isNumberRounding = ( typeof 'undefined' == number_format_fields[ field_id ][ field_column ]['isNumberRounding'] || 'norounding' == number_format_fields[ field_id ][ field_column ]['isNumberRounding'] ) ? -1 : parseInt( number_format_fields[ field_id ][ field_column ]['isNumberRounding'] );
		//var isNumberFixedPoint = number_format_fields[ field_id ][ field_column ].isNumberFixedPoint;
		var isNumberFixedPoint = typeof 'undefined' !== number_format_fields[ field_id ][ field_column ]['isNumberFixedPoint'] ? number_format_fields[ field_id ][ field_column ]['isNumberFixedPoint'] : false;
		//var isNumberRoundingDirection = number_format_fields[ field_id ][ field_column ].isNumberRoundingDirection;
		var isNumberRoundingDirection = typeof 'undefined' !== number_format_fields[ field_id ][ field_column ]['isNumberRoundingDirection'] ? number_format_fields[ field_id ][ field_column ]['isNumberRoundingDirection'] : 'roundclosest';
		var isNumberCalculationFormula = number_format_fields[ field_id ][ field_column ]['isNumberCalculationFormula'];

		var decimalSeparator = '.';
		var thousandSeparator = ',';

		if ( 'decimal_comma' == isNumberFormat ) {
			decimalSeparator = ',';
			thousandSeparator = '.';
		} else if ( 'decimal_none' == isNumberFormat ) {
			decimalSeparator = '.';
			thousandSeparator = '';
		}

		gformInitListNumberFormatFields( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

		itsg_setup_range( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

		if ( typeof 'undefined' !== isNumberCalculationFormula ) {
			itsg_setup_row_calculations( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
		}

		itsg_setup_total_columns( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );

	});
}

function gformInitListNumberFormatFields( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ) {
	jQuery( field ).keyup( function() {
		if ( jQuery( this ).hasClass( 'isNumberColumnTotal' ) ) {
			calc_column_total( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
		}
	});
	jQuery( field ).each( function(){
        jQuery( this ).change( function() {
			var $this = jQuery( this );
			if ( ! $this.is( 'select' ) && '' != $this.val() && '0' != $this.val() ) {
				var value = $this.val();
				var clean_value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
				var value = itsg_format_number_field( clean_value, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
				$this.val( value ).trigger( 'keyup' );
			}
		});
	});
}

function calc_column_total( field, form_id, field_id, field_column, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ) {
	var field = jQuery( '.gfield_list_' + field_id + '_cell' + field_column +' input' );
	var value = 0;
	var total_value = 0;

	if ( 'currency' == isNumberFormat ) {
		jQuery( 'table.gfield_list_container tbody tr:not(.isNumberColumnTotalRow)' ).find( field ).each( function() {
			var value = jQuery( this ).val();
			value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
			total_value += value;
		});
		total_value = itsg_format_number_field( total_value, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
	} else {
		jQuery( 'table.gfield_list_container tbody tr:not(.isNumberColumnTotalRow)' ).find( field ).each( function() {
			var value = jQuery( this ).val();
			value = itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
			total_value += parseFloat( value );
		});
		total_value = itsg_format_number_field( total_value, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
	}
	jQuery( '#field_' + form_id + '_' + field_id + ' div.ginput_container table tr.isNumberColumnTotalRow' ).find( 'td:nth-child(' + field_column + ') input' ).val( total_value );
}

function itsg_format_number_field( clean_value, isNumberFormat, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ) {
	// catch any undefined values
	if ( undefined == clean_value ) {
		clean_value = 0;
	}

	if ( 0 == clean_value.length ) {
		clean_value = 0;
	}

	clean_value = clean_value.toString(); // convert to string in case number passed

	var value_decimal = ( clean_value.split( '.' )[1] || [] ).length; // get the current number of decimal places

	if ( -1 == isNumberRounding ) {
		isNumberRounding = value_decimal; // get the current number of decimal places
	}

	if ( isNumberFixedPoint ) {
		value_decimal = isNumberRounding;
	}

	if ( 'currency' == isNumberFormat ){
		value = gformFormatMoney( clean_value );
		value = itsg_force_rounding( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
	} else {
		value = gformFormatNumber( clean_value, value_decimal, decimalSeparator, thousandSeparator ); // rounds closest
		value = itsg_force_rounding( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection );
	}

	return value;
}

function create_length_number( str, max ) {
	return str.length < max + 1 ? create_length_number( str + '0', max) : str;
}

function itsg_force_rounding( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ) {
	if ( isNumberFixedPoint ) {
		var decimal_places = ( value.split( decimalSeparator )[1] || [] ).length; // get the current number of decimal places
		if( decimal_places < isNumberRounding ) { // if current number of decimal places is less than the rounding limit
			// if decimal separator does not exist - add it
			if ( -1 == value.indexOf( decimalSeparator ) ) {
				value += decimalSeparator;
			}

			// add '0' padding until decimal places isNumberRounding has been met
			while( decimal_places < isNumberRounding ) {
				value += '0';
				decimal_places = value.substr( value.indexOf( decimalSeparator ) + 1 ).length;
			}
		}
	}

	// strip additional decimal places


	return value;
}

function toFixed( num, precision ) {
    return ( +( Math.round( + ( num + 'e' + precision ) ) + 'e' + -precision ) ).toFixed( precision );
}

// takes currency, comma or decimal separated numbers - cleans and passes through GF format function
function itsg_clean_number( value, isNumberRounding, decimalSeparator, thousandSeparator, isNumberFixedPoint, isNumberRoundingDirection ) {

	if ( undefined == value ) {
		return 0;
	}

	// remove any dollar symbols or non numeric characters -- allows decimal and negative symboles
	var value = value.replace( /(?![.,-])[\D+]/g, '' );

	// if decimal separator is comma (e.g. 9.999,00) convert to decimal (e.g. 9,999.99) by removing any dots and replacing comma with a dot
	if ( ',' == decimalSeparator ) {
		value = value.replace( /\./g, '' ).replace( /\,/g, '.' );
	}

	// remove any commas that remain (e.g. 9,999.99 to 9999.99)
	value = value.replace( /\,/g, '' );

	if ( ! gformIsNumber( value ) ) {
		var value = 0;
	}

	if ( 'rounddown' == isNumberRoundingDirection ) {
		var length = create_length_number( '1', isNumberRounding );
		var value = ( Math.floor( value * length ) / length );
	} else if ( 'roundup' == isNumberRoundingDirection ) {
		var length = create_length_number( '1', isNumberRounding );
		var value = ( Math.ceil( value * length ) / length );
	} else if ( 'roundclosest' == isNumberRoundingDirection ) {
		var value = parseFloat( value );
		if ( -1 != isNumberRounding ) {
			value = value.toFixed( isNumberRounding );
		}
	}

	value = value.toString();

	if ( ! isFinite( value ) ) {
		value = 0;
	}

	return parseFloat( value );
}

function itsg_gf_list_number_format_clean_row( row ) {
	row.find( 'div.range-error' ).remove();
	row.find( 'input.range-error' ).removeClass( 'range-error' );
}

// when field is added to repeater, runs the main function passing the current row
	jQuery( '.gfield_list' ).on( 'click', '.add_list_item,.delete_list_item', function(){
		var new_row = jQuery( this ).parents( 'tr.gfield_list_group' ).next( 'tr.gfield_list_group' );
		itsg_gf_list_number_format_clean_row( new_row );
	});

if ( '1' == itsg_gf_listnumformat_js_settings.is_entry_detail ) {
	// runs the main function when the page loads -- entry editor -- configures any existing upload fields
	jQuery(document).ready( function($) {
		itsg_gf_list_number_format_init();

		// function to the 'add list item' button click event
		gform.addFilter( 'gform_list_item_pre_add', function ( clone, group ) {
			itsg_gf_list_number_format_newrow( clone, group );
			return clone;
		});

		// bind to remove row function to update total columns
		var gformDeleteListItemOld = gformDeleteListItem;
		gformDeleteListItem = function( deleteButton, max ) {
			var container = jQuery( deleteButton ).parents('.gfield_list_container');
			var ret = gformDeleteListItemOld.apply( this, [ deleteButton, max ] );
			container.find( 'tr.gfield_list_group:first input.isNumberColumnTotal').each(function() {
				jQuery( this ).trigger( 'keyup' );
			});
			return ret;
		};
	});
} else {
	// runs the main function when the page loads -- front end forms -- configures any existing upload fields
	jQuery( document ).bind( 'gform_post_render', function($) {
		itsg_gf_list_number_format_init();

		// function to the 'add list item' button click event
		gform.addFilter( 'gform_list_item_pre_add', function ( clone, group ) {
			itsg_gf_list_number_format_newrow( clone, group );
			return clone;
		});

		// bind to remove row function to update total columns
		var gformDeleteListItemOld = gformDeleteListItem;
		gformDeleteListItem = function( deleteButton, max ) {
			var container = jQuery( deleteButton ).parents('.gfield_list_container');
			var ret = gformDeleteListItemOld.apply( this, [ deleteButton, max ] );
			container.find( 'tr.gfield_list_group:first input.isNumberColumnTotal').each(function() {
				jQuery( this ).trigger( 'keyup' );
			});
			return ret;
		};
	});
}