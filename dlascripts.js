var cur_block;

var top_nodes = [];
var dropped_nodes = [];
var all_files = [];
var typing = false;

// Structure for directory nodes
function dir_node(name, dirs, files, parent) {
    this.name = name;
    this.dirs = dirs;
    this.files = files;
    this.parent = parent;
    this.expanded = false;
  
}

// Structure for file nodes
function file_node(name, link, parent) {
    this.name = name;
    this.link = link;
    this.parent = parent;
}

// Fills the file nodes of a directory node
function fill_files(cur_node, tabbed) {
    if(tabbed) {
           
    }
    for(i = 0; i < cur_node.files.length; i++) {
        var fil_name = cur_node.files[i].name;
        var fil_link = cur_node.files[i].link;
        if (tabbed) {
            $('.' + cur_node.name + "drop").append("<div class='dropdown-files" + cur_node.name + "'><a target='_blank' href='" + fil_link + "'><div class='file-bar tabbed-bar files" + cur_node.name +"'>" + fil_name + "</div></a></div>");
        } else {
            $('.' + cur_node.name.replace(/\s+/g, '')).append("<div class='dropdown-files'><a target='_blank' href='" + fil_link + "'><div class='file-bar files" + cur_node.name +"'>" + fil_name + "</div></a></div>");
        }
        
    }
   
}

// Fills the directory nodes of a directory
function fill_dirs(cur_node, tabbed) {
    for(i = 0; i < cur_node.dirs.length; i++) {
        var dir_name = cur_node.dirs[i].name;
        if (tabbed) {
            $('.' + cur_node.name + "drop").append("<div class='" + dir_name.replace(/\s+/g, '') + "'><h2><div class='dir-bar tabbed-bar files" + cur_node.name +"'>" + dir_name + "<span class='arrow" + dir_name + " glyphicon glyphicon-circle-arrow-right pull-right'></span></div></h2></div>");
        } else {
            $('.' + cur_node.name.replace(/\s+/g, '')).append("<div class='" + dir_name.replace(/\s+/g, '') + "'><h2><div class='dir-bar'>" + dir_name + "<span class='arrow" + dir_name + " glyphicon glyphicon-circle-arrow-right pull-right'></span></div></h2></div>");
        }
        
    }
}

// Fills the tree of nodes
function populate(parent_name, dir) {
    var dir_name = dir.children('name').text();
    var sub_dirs = [];
    
    dir.children('dir').each(function() {
        var t_dir = populate(dir, $(this));
        sub_dirs.push(t_dir);
    });
    

    var sub_files = [];
    dir.children('file').each(function() {
        var file_name = $(this).children('name').text();
        var file_link = $(this).children('link').text();
        var file_parent = dir.children('name').text();
        var temp_file = new file_node(file_name, file_link, file_parent);
        sub_files.push(temp_file);
        all_files.push(temp_file);
    });
    var temp_dir = new dir_node(dir_name, sub_dirs, sub_files, parent_name);
    
    return temp_dir;
    
}

// Check for expanded dirs to close
function close_expansions(top_block) {
    var block_dir;
    for (block_dir = 0; block_dir < top_block.dirs.length; block_dir++) {
        if(top_block.dirs[block_dir].expanded) {
            top_block.dirs[block_dir].expanded = false;
            $(".arrow" + top_block.dirs[block_dir].name).addClass("glyphicon-circle-arrow-right");
            $(".arrow" + top_block.dirs[block_dir].name).removeClass("glyphicon-circle-arrow-down");
            $("." + top_block.dirs[block_dir].name).removeClass("droppedDir");
        }
        
        if(top_block.dirs[block_dir].dirs.length > 0) {
            close_expansions(top_block.dirs[block_dir]);   
        }
    }   
}

// Checks for search matches
function checkMatch(title) {
    title = title.replace(/ |-|_/g, "");
    var file_matches = [];
    var file_index;
    for(file_index = 0; file_index < all_files.length; file_index++) {
        var file_title = all_files[file_index].name.replace(/ |-|_/g, "");
        file_title.toLowerCase();
        var res = file_title.match(title);
        if (res != null ) {
            file_matches.push(all_files[file_index]);
        }
    }
    drawSearch(title, file_matches);
}

// Draws the typed in title and all the matches
function drawSearch(title, matches) {
    $(".search-area").after("<div class='results-area results'></div>");
    $(".results-area").append("<div class='title-bar results'>" + title + "</div>");
    var match_count;
    for(match_count = 0; match_count < matches.length; match_count++) {
           $(".results-area").append("<div class='dropdown-files results'><a target='_blank' href='" + matches[match_count].link + "'><div class='file-bar results'>" + matches[match_count].name + "</div></a></div>");
    }
    
    
    if(title.length == 0) {
        typing = false;
        $(".visible-search").text("");
        $(".end-search").toggleClass("visible-search");
        $(".results").remove();   
    }
    
}
 
// Findes the dir that has been clicked
function find_open_dir(cur_dir, text_match) {
    var dir_count;
    for(dir_count = 0; dir_count < cur_dir.dirs.length; dir_count++){
        if( cur_dir.dirs[dir_count].name == text_match) {
            return cur_dir.dirs[dir_count];   
        } else {
            if(cur_dir.dirs.length > 0) {
                var temp_dir = find_open_dir(cur_dir.dirs[dir_count], text_match);
                if(temp_dir != null) {
                    return temp_dir;
                }
            }
        }
    }
    return null;
}





// Loads the xml file, and sets up buttons
$(document).ready(function(){ 
    $.ajax({
        type: "GET",
        url: "http://wfs.sbcc.edu/Departments/LRC/computerlabonlineresources/DLACode/dlalinks.xml",
        dataType: "xml",
        success: function(xml) {
            $(xml).children().children('dir').each(function(){
                
                // Populate the top nodes array
                var $top_place = $(this);
                var top_name = $top_place.children('name').text();
                
                var tops = populate("top", $top_place);
                top_nodes.push(tops);
                
                
                
            }); 
            
            // Add areas for buttons and links
            $("#button-side-nav").addClass('button-side-nav'); 
            $("#link-space").addClass('link-space');
                
            for(x = 0; x < top_nodes.length; x++) {
                var cur_node = top_nodes[x];
                if(x == 0) {
                    $("#button-side-nav").append("<div class='little-block-selected' id='" + cur_node.name + "'>" + cur_node.name + "</div>"); 
                    
                } else {
                    $("#button-side-nav").append("<div class='little-block' id='" + cur_node.name + "'>" + cur_node.name + "</div>"); 
                }
                    
            }
            
            // Sets the first block to be selected and show the links for it
            cur_block = $('.little-block-selected');
            $('#link-space').append("<div class='" + cur_block.text().replace(/\s+/g, '') + "'><h3><div class='title-bar'>" + cur_block.text() + "</div></h3></div>");
            fill_dirs(top_nodes[0]);
            fill_files(top_nodes[0]);
            
             $("#search-field").val('');
        }
       
    });
            
    // Click functionality for the side navigation        
    $("#button-side-nav").on('click', '.little-block', function() {
            
        for(place = 0; place < top_nodes.length; place++){
            var cur_node = top_nodes[place].name;
            if(cur_node == cur_block.text()) {
                if(top_nodes[place].dirs.length > 0) {
                    close_expansions(top_nodes[place]); 
                } 
                $("." + cur_node.replace(/\s+/g, '')).remove();   
            }
        }
        
        
        
        // Changes previously selected block to a normal block, currently selected to a selected
        cur_block.toggleClass('little-block-selected');
        cur_block.toggleClass('little-block');
        cur_block = $(this);
        cur_block.toggleClass('little-block');
        cur_block.toggleClass('little-block-selected');
                
        $('#link-space').append("<div class='" + cur_block.text().replace(/\s+/g, '') + "'><h3><div class='title-bar'>" + cur_block.text() + "</div></h3></div>");
            
        // Puts the links onto the page
        for(index = 0; index < top_nodes.length; index++) {
            var cur_node = top_nodes[index];
            if (cur_node.name === cur_block.text() && cur_node.files.length > 0) {
                    
                fill_dirs(cur_node);
                fill_files(cur_node);
                    
            }
        }   
    });
    
    // Click functionality for expanding directories
    $("#link-space").on('click', '.dir-bar', function() {
        for(index = 0; index < top_nodes.length; index++) {
            var cur_node = top_nodes[index];
            if (cur_node.name == cur_block.text()) {
                
                var cur_dir = find_open_dir(cur_node, $(this).text());
                
                        if (!cur_dir.expanded){
                            $("." + cur_dir.name).append("<dir class='" + cur_dir.name + "drop'></dir>");
                            fill_dirs(cur_dir, true);
                            fill_files(cur_dir, true);
                            cur_dir.expanded = true;
                            $("." + cur_dir.name).addClass("droppedDir");
                            $(".arrow" + cur_dir.name).removeClass("glyphicon-circle-arrow-right");
                            $(".arrow" + cur_dir.name).addClass("glyphicon-circle-arrow-down");
                        } else {
                            $("." + cur_dir.name + "drop").empty();
                            $("." + cur_dir.name + "drop").remove();
                            $("." + cur_dir.name).removeClass("droppedDir");
                            $(".arrow" + cur_dir.name).addClass("glyphicon-circle-arrow-right");
                            $(".arrow" + cur_dir.name).removeClass("glyphicon-circle-arrow-down");
                            cur_dir.expanded = false;
                            close_expansion(cur_dir);
                        }
                   
                break;
            }
        }
    });
    
    // Search bar
    $("#search-field").on("keyup", function() {
        if(!typing) {
            typing = true;
            $(".end-search").toggleClass("visible-search");
            $(".visible-search").text("End Search");
        } 
        
        $(".results").remove();
        var text = $(this).val().toLowerCase();
        checkMatch(text);
    });
    
    // End search button
    $(".end-search").on("click", function() {
            typing = false;
            $(".visible-search").text("");
            $(".end-search").toggleClass("visible-search");
            $(".results").remove();
            $("#search-field").val('');
    });
});