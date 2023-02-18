+++
title = "Reference Post"
description="Reference Post"

date = 2019-01-01
updated = 2021-02-03
draft = true

path = "testing"

[taxonomies]
tags = ["some", "post"]

[extra]
no_header = false
og_image = "https://www.mufeedvh.com/blog/llm-security.png"
+++

Reference post.

<div style="text-align: center; font-size: 13px;">
    <pre id="share-button" onclick="share_button();" style="cursor: pointer;">Link to this article 🔗</pre>
    <pre onclick="twitter_follow();" style="cursor: pointer;">Follow me on <span class="fa-brands fa-twitter"></span></pre>
</div>

<script>
    function share_button() {
        if (navigator.share) {
            navigator.share({
                title: document.querySelector('meta[property="og:title"]').content,
                text: document.querySelector('meta[name="description"]').content,
                url: document.querySelector('link[rel="canonical"]').href
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            document.getElementById('share-button').innerHTML = 'Copied link to clipboard! ✅';
        }
    }

    function twitter_follow() {
        window.location.href = "https://twitter.com/mufeedvh";
    }
</script>

<style>:host,:root{--fa-font-brands:normal 400 1em/1 "Font Awesome 6 Brands"}@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:block;src:url('/fonts/fa-brands-400.woff2') format("woff2"),url('/fonts/fa-brands-400.ttf') format("truetype")}.fa-brands,.fab{font-family:"Font Awesome 6 Brands";font-weight:400}.fa-github:before{content:"\f09b"}.fa-github-alt:before{content:"\f113"}.fa-github-square:before{content:"\f092"}.fa-twitter:before{content:"\f099"}.fa-twitter-square:before{content:"\f081"}.fa-instagram:before{content:"\f16d"}.fa-instagram-square:before{content:"\e055"}.fa-youtube:before{content:"\f167"}.fa-youtube-square:before{content:"\f431"}</style>