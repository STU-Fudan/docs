/**
 * Created by dsds on 8/21/14.
 */
(function(){
    var file_dir = $("#docs_dir_select_input").val();
    var files = [];
    var dir_field = $("#docs_dir_field");
    var new_folder_edit_lock = false;
    var file_tree = {
        dir: file_dir,
        files: [],
        menus: []
    };
    dir_field.on("contextmenu", function(evt) {evt.preventDefault();});

    var draw_file_icon = function(file, no) {
        var icon;
        switch(file.post_type) {
            case "post":
                icon = "-file-text-o";
                break;
            case "folder":
                icon = "-folder-open-o";
                break;
            case "page":
                icon = "-file-o";
                break;
            case "default":
                icon = "-file";
        }
        var output = "<div class='docs_file_icon'>"
            + "<input class='docs_file_select_checkbox' id='file-" + no + "' type='checkbox'/>"
            + "<label class='docs_file_select_label "
            + (file.post_type == "folder" ? "docs_folder_label" : "docs_file_label")
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

    var remove_file = function(id) {
        $("#docs_file_loading_gif").css("opacity", "1");
        $.ajax({
            type: "GET",
            url: "admin-ajax.php",
            dataType: 'html',
            data: ({ action: 'removefile', file_id: id }),
            success: function(data){
                console.log(data);
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
    };

    var remove_folder = function(id) {
        $("#docs_file_loading_gif").css("opacity", "1");
        $.ajax({
            type: "GET",
            url: "admin-ajax.php",
            dataType: 'html',
            data: ({ action: 'removefolder', folder_id: id }),
            success: function(data){
                console.log(data);
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
    };

    var refresh_files_field = function() {
        dir_field.html("<div id='docs_file_loading_gif'></div>");
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
        setTimeout(function() {
            $(".docs_file_icon").css("opacity", "1");
        }, 100);
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
            var submit_folder = function() {
                $("#docs_file_loading_gif").css("opacity", "1");
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
            };
            $("#docs_new_folder_input").blur(submit_folder).keypress(function(event) {
                if (event.which == 13 || event.keyCode == 13) {
                    submit_folder(event);
                    return false;
                }
                return true;
            });
            setTimeout(function() {
                $(".docs_file_icon").css("opacity", "1");
            }, 100);
        });
        $("#docs_level_up").click(function() {
            $("#docs_file_loading_gif").css("opacity", "1");
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
        $(".docs_folder_label").dblclick(function() {
            $("#docs_file_loading_gif").css("opacity", "1");
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
        }).mousedown(function(event) {
            $("#right_menu").remove();
            if (event.which == 3) {
                event.stopPropagation();
                dir_field.append("<ul id='right_menu'>"
                    + "<li id='view_btn' data-for='" + $(this).attr("for") + "'>Visit</li>"
                    + "<li id='delete_btn' data-for='" + $(this).attr("for") + "'>Delete</li>"
                    + "</ul>");
                var x = event.clientX - dir_field.offset().left;
                var y = event.clientY - dir_field.offset().top;
                $("#right_menu").css({
                    "left": x - 2,
                    "top": y - 12
                });
                $("#right_menu").mousedown(function(event) {
                    event.stopPropagation();
                });
                $("#view_btn").click(function() {
                    var file_to_view = files[+ $(this).attr("data-for").split("-")[1]];
                    var win = window.open(file_to_view.guid, '_blank');
                    win.focus();
                    $("#right_menu").remove();
                });
                $("#delete_btn").click(function() {
                    var file_to_delete = files[+ $(this).attr("data-for").split("-")[1]];
                    if(confirm("Are you sure to delete " + file_to_delete.post_title + " and ALL files below this folder?")) {
                        remove_folder(file_to_delete.ID);
                    }
                    $("#right_menu").remove();
                });
            }
        });
        $(".docs_file_label").mousedown(function(event) {
            $("#right_menu").remove();
            if (event.which == 3) {
                event.stopPropagation();
                dir_field.append("<ul id='right_menu'>"
                    + "<li id='view_btn' data-for='" + $(this).attr("for") + "'>Visit</li>"
                    + "<li id='delete_btn' data-for='" + $(this).attr("for") + "'>Delete</li>"
                    + "</ul>");
                var x = event.clientX - dir_field.offset().left;
                var y = event.clientY - dir_field.offset().top;
                $("#right_menu").css({
                    "left": x - 2,
                    "top": y - 12
                });
                $("#right_menu").mousedown(function(event) {
                    event.stopPropagation();
                });
                $("#view_btn").click(function() {
                    var file_to_view = files[+ $(this).attr("data-for").split("-")[1]];
                    var win = window.open(file_to_view.guid, '_blank');
                    win.focus();
                    $("#right_menu").remove();
                });
                $("#delete_btn").click(function() {
                    var file_to_delete = files[+ $(this).attr("data-for").split("-")[1]];
                    if(confirm("Are you sure to delete " + file_to_delete.post_title + "?")) {
                        //console.log(file_to_delete);
                        remove_file(file_to_delete.ID);
                    }
                    $("#right_menu").remove();
                });
            }
        });
        return true;
    };
    dir_field.mousedown(function() {
        $("#right_menu").remove();
    });
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
    $("#docs_dir_select_input").keypress(function(event) {
        if (event.which == 13 || event.keyCode == 13) {
            file_dir = $(this).val();
            $("#docs_file_loading_gif").css("opacity", "1");
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
        return true;
    });
})();