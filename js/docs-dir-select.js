/**
 * Created by dsds on 8/21/14.
 */
(function(){
    var file_dir = $("#docs_dir_select_input").val();
    var file_id = id;
    var files = [];
    var dir_field = $("#docs_dir_field");
    var new_folder_edit_lock = false;
    var file_tree = {
        dir: file_dir,
        files: [],
        menus: []
    };
    var draw_file_icon = function(file, no) {
        var icon;
        switch(file.post_type) {
            case "post":
                icon = "-file-text-o";
                break;
            case "folder":
                icon = "-folder-open-o";
                break;
            case "default":
                icon = "-file";
        }
        var output = "<div class='docs_file_icon'>"
            + "<input class='docs_file_select_checkbox' id='file-" + no + "' type='checkbox'/>"
            + "<label class='docs_file_select_label "
            + (file.post_type == "folder" ? "docs_folder_label" : "")
            + "' for='file-" + no + "'></label>"
            + "<div class='docs_file_icon_inner'>"
            + "<div class='docs_file_icon_pic'>"
            + "<i class='fa fa" + icon + " fa-5x'></i>"
            +"</div>"
            + "<span class='docs_file_icon_title'>"
            + file.post_title + "</span>"
            + "</div>"
            + "</div>";
        return output;
    };
    var refresh_files_field = function() {
        dir_field.html("");
        if(file_dir != "/") {
            dir_field.append(("<div class='docs_file_icon'><div class='docs_file_icon_inner'>"
                + "<label id='docs_level_up' class='docs_file_select_label'></label>"
                + "<div class='docs_file_icon_pic'>"
                + "<i class='fa fa-level-up fa-5x'></i></div><span class='docs_file_icon_title'>"
                + "Parent Folder</span></div></div>"));
        }
        for(var i = 0; i < files.length; ++i) {
            dir_field.append(draw_file_icon(files[i], i));
        }
        dir_field.append(("<div class='docs_file_icon'><div class='docs_file_icon_inner'>"
            + "<label id='docs_add_new_folder' class='docs_file_select_label'></label>"
            + "<div class='docs_file_icon_pic'>"
            + "<i class='fa fa-plus fa-5x'></i></div><span class='docs_file_icon_title'>"
            + "Add new folder</span></div></div>"));
        $("#docs_add_new_folder").click(function() {
            if(new_folder_edit_lock) {
                return false;
            }
            new_folder_edit_lock = true;
            dir_field.prepend("<div class='docs_file_icon'><div class='docs_file_icon_inner'>"
                + "<div class='docs_file_icon_pic'>"
                + "<i class='fa fa-folder-open-o fa-5x'></i></div>"
                + "<input id='docs_new_folder_input' class='docs_file_icon_title' type='text' autofocus/>"
                + "</div></div>");
            $("#docs_new_folder_input").keypress(function(event) {
                if (event.which == 13 || event.keyCode == 13) {
                    $.ajax({
                        type: "GET",
                        url: "admin-ajax.php",
                        dataType: 'html',
                        data: ({ action: 'addnewfolder', base_dir: file_dir, folder_name: $(this).val()}),
                        success: function(data){
                            console.log(data);
                            new_folder_edit_lock = false;
                            $.ajax({
                                type: "GET",
                                url: "admin-ajax.php",
                                dataType: 'html',
                                data: ({ action: 'queryposts', meta: file_dir}),
                                success: function(data){
                                    files = $.parseJSON(data);
                                    refresh_files_field();
                                }
                            });
                        }
                    });
                    return false;
                }
                return true;
            });
        });
        $("#docs_level_up").click(function() {
            file_dir = file_dir.substr(0, file_dir.lastIndexOf("/"));
            file_dir = file_dir.substr(0, file_dir.lastIndexOf("/"));
            file_dir += "/";
            $("#docs_dir_select_input").val(file_dir);
            $("#docs_dir_display").html(file_dir);
            $.ajax({
                type: "GET",
                url: "admin-ajax.php",
                dataType: 'html',
                data: ({ action: 'queryposts', meta: file_dir}),
                success: function(data){
                    files = $.parseJSON(data);
                    refresh_files_field();
                }
            });
        });
        $(".docs_folder_label").click(function() {
            file_dir += $(this).next(".docs_file_icon_inner").children("span").html() + "/";
            $("#docs_dir_select_input").val(file_dir);
            $("#docs_dir_display").html(file_dir);
            $.ajax({
                type: "GET",
                url: "admin-ajax.php",
                dataType: 'html',
                data: ({ action: 'queryposts', meta: file_dir}),
                success: function(data){
                    files = $.parseJSON(data);
                    refresh_files_field();
                }
            });
        });
        return true;
    };
    $.ajax({
        type: "GET",
        url: "admin-ajax.php",
        dataType: 'html',
        data: ({ action: 'queryposts', meta: file_dir}),
        success: function(data){
            files = $.parseJSON(data);
            refresh_files_field();
        }
    });
})();