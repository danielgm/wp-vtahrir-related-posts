// This uses the JQuery library that comes with Wordpress

jQuery(document).ready(function($){
	
	// Activate tabs
	
	current_tab = 1;
	$("#MRP_tabs .MRP_tab a").click(function() {
		$("#MRP_relatedposts .MRP_post_type").removeClass('MRP_current');
		$("#MRP_relatedposts .MRP_post_type").hide();
		$("#MRP_relatedposts .MRP_tab").removeClass('MRP_current_tab');
		tabToShowId = $(this).attr('rel');
		$(this).parent().addClass('MRP_current_tab');
		$('#'+tabToShowId).show();
		var parts = tabToShowId.split("-");
		current_tab = parts[parts.length-1];
		return false;
	});

	$(".MRP_search").bind( 'keydown', function(e){
		if( e.keyCode == 13 ){
			return false;
		}
	});

	var timer = 0;	
	$(".MRP_search").bind( 'keyup', function(e){
		var id = $(this).attr('id');
		if( ( e.keyCode > 47 && e.keyCode < 91 ) || e.keyCode == 8 || e.keyCode == 13 ){
			clearTimeout( timer );
			timer = setTimeout( function() {
						MRP_search(id);
					}, 200 );
		}
	});
	
	$(".MRP_scope input").each( function() {
		$(this).change(function() {
			MRP_search($(this).attr('id'));
		});
	});
	
	$('.MRP_related_post_types')
		.append('<option value="__NEW__">New type...</option>')
		.change(function (event) {
			if (event.currentTarget.value == '__NEW__') {
				var name = prompt("Enter the name of the new type:", '');
				name = name.toLowerCase();
				
				// Make sure the type doesn't already exist.
				if ($(event.currentTarget).find('option[value="' + name + '"]')) {
					// Add the option to all the related post type select lists.
					$('.MRP_related_post_types option[value="__NEW__"]').before('<option value="' + name + '">' + name + '</option>');
				}
				
				// Select the new value in the current select list.
				$(event.currentTarget).val(name);
			}
		});
	
	$('.MRP_deletebtn').click(function (event) {
		var postID = $(event.currentTarget).parent().parent().find('.MRP_related_post_ids').val();
		MRP_remove_relationship('related-post-' + postID);
	});

	function MRP_search(id) {
		var parts = id.split("-");
		var postTypeIndex = parts[parts.length-1];
		if( $("#MRP_search-"+postTypeIndex).val() != '' ) {
			var searchResults = "../wp-content/plugins/vtahrir-related-posts/mrp-search.php?mrp_s=" + encodeURIComponent( $("#MRP_search-"+postTypeIndex).val() );
			searchResults += "&mrp_scope=" + escape( $("input[name='MRP_scope-"+postTypeIndex+"']:checked").val() );
			searchResults += "&mrp_post_type=" + escape( $("#MRP_post_type_name-"+postTypeIndex).val() );
			if( $("#post_ID").val() ) {
				searchResults += "&mrp_id=" + escape( $("#post_ID").val() ); 
			}
			$("#MRP_loader-"+postTypeIndex).addClass("MRP_loader_active");
			$("#MRP_results-"+postTypeIndex).load( searchResults, '', 
				function() { $("#MRP_results-"+postTypeIndex+" li .MRP_result").each(function(i) {
						$(this).click(function() {
							var postID = this.id.substring(7);
							var resultID = "related-post-" + postID;
							if( $("#"+resultID).text() == '' ) {
								$("#MRP_related_posts_replacement-"+postTypeIndex).hide();
								$('.MRP_relatedposts_container').show();
								
								var post = $('#related-post-0').clone(true); // Clone the prototype post.
								post.attr('id', resultID);
								post.attr('style', ''); // Prototype post is hidden. Unhide the clone.
								post.find('.MRP_related_post_ids').attr('value', postID);
								post.find('.MRP_deletebtn').attr('onclick', 'MRP_remove_relationship("' + resultID + '")');
								post.find('.MPR_post_title').text($(this).text());
								
								$("#MRP_relatedposts_list-"+postTypeIndex).append(post);
								
								$("#MRP_related_count-"+postTypeIndex).text( ( parseInt($("#MRP_related_count-"+postTypeIndex).text())+1 ) );
							}
							else {
								$("#"+resultID ).focus();
								$("#"+resultID ).css("color", "red");
								setTimeout('document.getElementById("'+resultID+'").style.color = "#000000";', 1350);
							}
						});	 					
					});
					$("#MRP_loader-"+postTypeIndex).removeClass("MRP_loader_active");
				}
			);
		}
		else {
			$("#MRP_results-"+postTypeIndex).html("");
		}
	}
});

function MRP_remove_relationship( postID ) {
	jQuery(document).ready(function($){
		$("#"+postID).remove();
		$("#MRP_related_count-"+current_tab).text( ( parseInt($("#MRP_related_count-"+current_tab).text())-1 ) );
		if( $("#MRP_relatedposts_list-"+current_tab+" li").length < 2 ){
			$("#MRP_related_posts_replacement-"+current_tab).show();
		}
	});
}