# docs

`docs` is a wordpress plugin, it provides **CMS / file tree system** to wordpress. So you can make wordpress a wiki system or something else.

### Preview

![1](demo-1.png)

![2](demo-2.png)

### Installation

Just copy the `docs` folder to `/wp-content/plugins/` and enable the plugin.

### Documents

#### Manage directory

There is a `Finder` option added to the admin bar. You can add folders, double-click open folders, select to preview posts, double-click to edit posts, drag & drop to move files, or right-click on icons.

#### List the directory in front pages

Add `<?php echo return_posts_list_html_under_dir('/'); ?>` to your theme PHP file, `index.php` for example.

It will generate a list of files and folders under the directory now. The URL of folder is like `?folder={{folder_title}}`.

The `<li><a>` tags in this list will contain classes `go_parent`, `posts_list_post` or `posts_list_folder`, you can adjust the CSS file by yourself.

### Info

`Font awesome` and `jQuery` are used.

### Author / License

This plugin is developed for `Fudan STU Wiki System`.

Author: [Shu Ding](https://github.com/quietshu)

License: The MIT License
