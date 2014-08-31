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
    var mouse_x, mouse_y;
    var drag_file = null, initalization = false, open_folder = null;
    dir_field.on("contextmenu", function(evt) {evt.preventDefault();});

    var draw_file_icon = function(file, no) {
        var icon;
        switch(file.post_type) {
            case "post":
                icon = "-file-text-o";
                break;
            case "folder":
                icon = "-folder-o";
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

    var move_file = function(id_a, id_b) {
        $("#docs_file_loading_gif").css("opacity", "1");
        $.ajax({
            type: "GET",
            url: "admin-ajax.php",
            dataType: 'html',
            data: ({ action: 'movefile', from: id_a, to: id_b }),
            success: function(data){
                console.log(data);
                $.ajax({
                    type: "GET",
                    url: "admin-ajax.php",
                    dataType: 'html',
                    data: ({ action: 'queryposts', meta: file_dir}),
                    success: function(data){
                        files = $.parseJSON(data);
                        drag_file = null;
                        open_folder = null;
                        setTimeout(refresh_files_field, 300);
                    }
                });
            }
        });
        return false;
    };

    var move_to_parent = function(id) {

    };

    var refresh_files_field = function() {
        dir_field.html("<div id='docs_file_loading_gif'></div>");
        if(file_dir != "/") {
            dir_field.append(("<div class='docs_file_icon'><label id='docs_level_up' class='docs_file_select_label'></label>"
                + "<div class='docs_file_icon_inner'>"
                + "<div class='docs_file_icon_pic'>"
                + "<i class='fa fa-level-up fa-5x'></i></div><span class='docs_file_icon_title'>"
                + "Parent Folder</span></div></div>"));
        }
        for(var i = 0; i < files.length; ++i) {
            dir_field.append(draw_file_icon(files[i], i));
        }
        dir_field.append(("<div class='docs_file_icon'><label id='docs_add_new_folder' class='docs_file_select_label'></label>"
            + "<div class='docs_file_icon_inner'>"
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
        $(".docs_file_label").dblclick(function() {
            var file_to_view = files[+ $(this).attr("for").split("-")[1]];
            var win = window.open("post.php?post=" + file_to_view.ID + "&action=edit", '_blank');
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
                    if(confirm("Are you sure to delete " + file_to_delete.post_title + "?")) {
                        //console.log(file_to_delete);
                        remove_file(file_to_delete.ID);
                    }
                    $("#right_menu").remove();
                });
            }
        });
        $(".docs_file_icon").mousedown(function(event) {
            if(!$(this).children("input").length)
                return false;
            if(event.which != 1)
                return false;
            drag_file = $(this);
            initalization = false;
            mouse_x = event.pageX - $(this).position().left;
            mouse_y = event.pageY - $(this).position().top;
        }).mouseenter(function(event) {
                if(drag_file != null && !drag_file.is($(this))) {
                    if($(this).children(".docs_folder_label").length) {
                        $(this).find(".fa").attr("class", "fa fa-folder-open-o fa-5x");
                        open_folder = $(this);
                    }
                    else if($(this).children("#docs_level_up").length){
                        open_folder = $(this);
                    }
                }
            }).mouseleave(function(event) {
                if(open_folder.is($(this))) {
                    if($(this).children(".docs_folder_label").length) {
                        $(this).find(".fa").attr("class", "fa fa-folder-o fa-5x");
                    }
                    open_folder = null;
                }
            });
        $(document).mouseup(function(event) {
            if(drag_file != null) {
                $(drag_file).css({
                    "position": "inherit",
                    "left": "inherit",
                    "top": "inherit"
                });
                if(open_folder != null) {
                    if(confirm("Are you sure to move "
                        + files[+drag_file.children(".docs_file_select_checkbox").attr("id").split("-")[1]].post_title
                        + " to " + files[+open_folder.children(".docs_file_select_checkbox").attr("id").split("-")[1]].post_title
                        + "?")) {
                        if (open_folder.children(".docs_folder_label").length) {
                            open_folder.find(".fa").attr("class", "fa fa-folder-o fa-5x");
                            move_file(files[+drag_file.children(".docs_file_select_checkbox").attr("id").split("-")[1]].ID,
                                files[+open_folder.children(".docs_file_select_checkbox").attr("id").split("-")[1]].ID
                            );
                        }
                        else {
                            move_to_parent(files[+drag_file.children(".docs_file_select_checkbox").attr("id").split("-")[1]].ID);
                        }
                    }
                }
                drag_file = null;
            }
        });
        $(document).mousemove(function() {
            if(drag_file != null) {
                if(!initalization) {
                    initalization = true;
                    drag_file.css("position", "absolute");
                }
                drag_file.css({
                    "left": event.pageX - mouse_x,
                    "top": event.pageY - mouse_y
                });
            }
        });
        if($("#file_preview"))
            $(".docs_file_icon input ~ label").click(function() {
                if($(".docs_file_select_checkbox:checked").length === 0 && !$("#" + $(this).attr("for")).is(":checked")) {
                    $("#file_preview").html(files[+$(this).attr("for").split("-")[1]].post_content);
                    return;
                }
                else if($(".docs_file_select_checkbox:checked").length === 2 && $("#" + $(this).attr("for")).is(":checked")) {
                    var ids = $("input[type=checkbox]:checked");
                    var file_id;
                    if(+$(ids[0]).attr("id").split("-")[1] == +$(this).attr("for").split("-")[1])
                        file_id = +$(ids[1]).attr("id").split("-")[1];
                    else
                        file_id = +$(ids[0]).attr("id").split("-")[1];
                    $("#file_preview").html(files[file_id].post_content);
                    return;
                }
                $("#file_preview").html("");
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