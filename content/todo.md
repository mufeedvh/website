+++
title = "todo"
description = "a public facing todo list."

[extra]
no_header = true
+++

**a public facing todo list.**

<style>
    input[type="checkbox"]{
        box-shadow: 0 0 0 2px orange;
    }

    input[type="checkbox"]:checked {
        box-shadow: 0 0 0 2px green;
    }  
</style>

<div id="todos">
    Loading...
</div>

<script>
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var todos = JSON.parse(xhttp.responseText).todos;

            var elem = "<ul>";
            for (i in todos) {
                var task = todos[i];
                if (task.includes("[done]")) {
                    task = task.replace("[done]", "");
                    elem += '<li><input disabled="" type="checkbox" checked> ' + task + '</li>';
                } else {
                    elem += '<li><input disabled="" type="checkbox"> ' + task + '</li>';
                }
            }
            elem += "</ul>";

            document.getElementById('todos').innerHTML = elem;
        }
    };

    xhttp.open("GET", "https://api.mufeedvh.com/list", true);
    xhttp.send();
</script>