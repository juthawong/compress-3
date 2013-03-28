var css, js, img;

function bind(){
    css = document.getElementById('css');
    js  = document.getElementById('js');
    img = document.getElementById('img');
    msg = document.getElementById('infobox');

    css.addEventListener('click', function(){
        window.dispatchEvent(new Event('css-compress'));
    });

    js.addEventListener('click', function(){
        window.dispatchEvent(new Event('js-compress'));
    });

    img.addEventListener('click', function(){
        window.dispatchEvent(new Event('img-compress'));
    });

    window.addEventListener('error-evt', function(e){
        msg.innerHTML = "<h2>Error</h2>" + e.extra;
    });

    window.addEventListener('success-evt', function(e){
        msg.innerHTML = "<h2>Success</h2>" + e.extra;
    });
}

