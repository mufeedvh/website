+++
title = "I see everything like pottery"
description="Just some rambling on sculpting things into place."

date = 2023-02-18
updated = 2023-02-18
draft = false

path = "pottery"

[taxonomies]
tags = ["rambling"]

[extra]
no_header = false
og_image = "https://www.mufeedvh.com/blog/pottery.jpg"
+++

<img src="/blog/pottery.jpg" width="100%" alt="a pottery scene from the anime let's make a mug too with the caption 'This is a technique called hand-building'">

<br>

It was just another day, I am procrastinating work by watching reels of one of my favorite Instagram accounts [@thrdfloor](https://www.instagram.com/thrdfloor), an account sharing the lifestyle of a self-taught ceramic/pottery artist. Watching one of their reels in which he is molding a pot made me think of how everything we do is just sculpting things into place. Too deep huh? I know, just bear me with me here.

It's not just creations but even our personality. We shape ourselves according to different experiences and outcomes. It's exactly like pottery, the clay being our character and the base being our experiences.

This could be applied to just about everything and I think doing so is a good framework for how we perceive everything hence this small piece.

Yep, I mean framework in the same sense we could apply [Bayesian thinking](https://www.youtube.com/watch?v=BrK7X_XlGB8) to our decisions. It gives you a clear dichotomy to what factors of a specific thing you perceive as the pot, the base, and the sculptor.

Imagine all your creations, the process of improving your "self", or just learning something as a process of making pottery. Whatever you label as the pot or the base is up to you but doing so will give you a perspective of what factors matter in that specific experience and in what shape the pot should be sculpted.

One of the examples that got to my head was the process of coding.

Coding feels like pottery to me, the clay is the code, the base is your computer, and we just sculpt it into different pots we call programs.

This wouldn't make sense for someone who's not into coding which probably the majority of the readers of this piece are going to be. So here's another that I think gives it a different perspective.

Applying this to personal relationships would mean that the relationship itself is the clay, the base is the direction we take it to, and here the sculptors are (both) the parties in the relationship, meaning they should compromise and align their hands to shape the pot they wish to have.

So that's the random word soupy pottery framework I came up with, hope it works.

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