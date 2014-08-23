<?php
/**
 * @package docs file system
 * @version 0.1
 */
/*
Plugin Name: docs file system
Plugin URI: https://github.com/STU-Fudan/docs
Description: Docs provides CMS / file tree system to wordpress. So you can make wordpress a wiki system or something else.
Author: Shu Ding
Version: 0.1
Author URI: http://github.com/quietshu
*/

add_action('init', 'docs_add_folder_type');
add_action('edit_form_after_title', 'docs_dir_select_form');
add_action('load-post.php', 'docs_post_meta_boxes_setup');
add_action('load-post-new.php', 'docs_post_meta_boxes_setup');
add_action('wp_ajax_queryposts', 'query_post');
add_action('wp_ajax_nopriv_queryposts', 'query_post');
add_action('wp_ajax_addnewfolder', 'add_new_folder');
add_action('wp_ajax_nopriv_addnewfolder', 'add_new_folder');
add_action('wp_ajax_removefile', 'remove_file');
add_action('wp_ajax_nopriv_removefile', 'remove_file');
add_action('wp_ajax_removefolder', 'remove_folder');
add_action('wp_ajax_nopriv_removefolder', 'remove_folder');
add_action('admin_menu', 'docs_files_admin_menu');

function docs_files_admin_menu() {
    add_menu_page("Docs Finder", "Finder", "manage_options", "docs_finder", "finder_menu_function", "dashicons-media-default", 3 );
}

function finder_menu_function() {
    if ( !current_user_can( 'manage_options' ) )  {
        wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
    }
    wp_nonce_field( basename( __FILE__ ), 'docs_post_class_nonce' );
    echo '<div class="wrap">';
    echo '<p>File System: ';
    echo '<input class="widefat" type="text" name="docs_dir_select" id="docs_dir_select_input" value="/" size="30"/></p>';
    echo '<link rel="stylesheet" href="' . plugins_url() . '/docs/css/font-awesome.css"/>';
    echo '<link rel="stylesheet" href="' . plugins_url() . '/docs/css/docs-dir-select.css"/>';
    echo '<div id="docs_dir_field"></div>';
    echo '<script src="' . plugins_url() . '/docs/js/jquery.min.js"></script>';
    echo '<script src="' . plugins_url() . '/docs/js/docs-dir-select.js"></script>';
    echo '</div>';
}

function docs_add_folder_type() {
    $labels = array(
        'name' => _x('folder', 'This is a folder'),
        'singular_name' => _x('folder', 'folder singular name'),
        'add_new' => _x('Add New', 'folder'),
        'add_new_item' => __('Add New Folder'),
        'edit_item' => __('Edit Folder Information'),
        'new_item' => __('New Folder'),
        'view_item' => __('View Folder Information'),
        'search_items' => __('Search Folders'),
        'not_found' =>  __('No Folder found'),
        'not_found_in_trash' => __('No Folder found in Trash'),
        'parent_item_colon' => ''
    );

    $supports = array('title', 'excerpt', 'custom-fields');

    register_post_type( 'folder',
        array(
            'labels' => $labels,
            'public' => false,
            'supports' => $supports
        )
    );
}

function docs_dir_select_form() {
    wp_nonce_field( basename( __FILE__ ), 'docs_post_class_nonce' );
    echo "<div id='docs_dir_select' class='postbox'>";
    echo '<h3 class="hndle"><span>Directory</span></h3>';
    echo '<div class="inside">';
    echo '<p id="docs_dir_display">';
    $edit_post_id = get_the_ID();
    $edit_post_dir = get_post_meta($edit_post_id, "dir", true);
    if ($edit_post_dir == "") {
        $edit_post_dir = "/";
        update_post_meta($edit_post_id, "dir", "/");
    }
    echo 'File directory: ' . $edit_post_dir;
    echo '</p>';
    echo '<link rel="stylesheet" href="' . plugins_url() . '/docs/css/font-awesome.css"/>';
    echo '<link rel="stylesheet" href="' . plugins_url() . '/docs/css/docs-dir-select.css"/>';
    echo '<input class="widefat" type="text" name="docs_dir_select" id="docs_dir_select_input" value="' . $edit_post_dir . '" size="30" style="display:none"/>';
    echo '<div id="docs_dir_field"></div>';
    echo '<script>var id=' . $edit_post_id . ';</script>';
    echo '<script src="' . plugins_url() . '/docs/js/jquery.min.js"></script>';
    echo '<script src="' . plugins_url() . '/docs/js/docs-dir-select.js"></script>';
    echo '</div>';
    echo "</div>";
}

function docs_post_meta_boxes_setup() {
    add_action( 'save_post', 'docs_save_post_class_meta', 10, 2 );
}

function docs_save_post_class_meta($post_id, $post) {
    if(!isset($_POST['docs_post_class_nonce']) || !wp_verify_nonce($_POST['docs_post_class_nonce'], basename(__FILE__)))
        return $post_id;

    $post_type = get_post_type_object( $post->post_type );
    if(!current_user_can( $post_type->cap->edit_post, $post_id))
        return $post_id;

    $new_meta_value = (isset( $_POST['docs_dir_select']) ? $_POST['docs_dir_select'] : '');

    $meta_key = 'dir';
    update_post_meta( $post_id, $meta_key, $new_meta_value );
}

function query_post() {
    $meta = $_GET['meta'];
    $args = array(
        'meta_key' => 'dir',
        'meta_value' => $meta,
        'posts_per_page' => -1,
        'post_type' => array('post', 'page', 'folder')
    );

    $posts = get_posts($args);

    $output = json_encode($posts);

    die($output);
}

function add_new_folder() {
    $base_dir = $_GET['base_dir'];
    $folder_name = $_GET['folder_name'];
    $folder_name = str_replace("/", "", $folder_name);
    if(empty($folder_name))
        die("FAIL");
    $the_folder = array(
        "post_title"  => $folder_name,
        "post_type"   => "folder",
        "post_status" => "publish",
    );
    $new_id = wp_insert_post($the_folder);
    update_post_meta( $new_id, "dir", $base_dir );
    die("SUCC");
}

function remove_file() {
    $post_id = $_GET['file_id'];
    wp_delete_post($post_id);
}

function remove_all_files_under($folder_id) {
    $dir = get_post_meta($folder_id, "dir", true) . get_the_title($folder_id) . "/";
    $args = array(
            'meta_key' => 'dir',
            'meta_value' => $dir,
            'posts_per_page' => -1,
            'post_type' => array('post', 'page', 'folder')
        );
    $posts = get_posts($args);
    foreach($posts as $post) {
        if($post->post_type == "folder") {
            remove_all_files_under($post->ID);
        }
        else wp_delete_post($post->ID);
    }
    wp_delete_post($folder_id);
}

function remove_folder() {
    $post_id = $_GET['folder_id'];
    die(remove_all_files_under($post_id));
}

?>
