<?php
get_header();
echo return_posts_list_html_under_dir(get_post_meta(get_the_ID(), "dir", true) . get_the_title(get_the_ID()) . "/");
?>

<?php get_sidebar(); ?>
<?php get_footer(); ?>