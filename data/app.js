var app = module.exports = require('appjs')
  , http = require('http')
  , fs = require('fs')
  , Kraken = require('kraken')
  , request = require('request')
  , UglifyJS = require("uglify-js")
  , cleanCSS = require('clean-css');

app.serveFilesFrom(__dirname + '/content');


var menubar = app.createMenu([{
  label:'&File',
  submenu:[
    {
      label:'E&xit',
      action: function(){
        window.close();
      }
    }
  ]
},{
  label:'&Window',
  submenu:[
    {
      label:'Fullscreen',
      action:function(item) {
        window.frame.fullscreen();
        console.log(item.label+" called.");
      }
    },
    {
      label:'Minimize',
      action:function(){
        window.frame.minimize();
      }
    },
    {
      label:'Maximize',
      action:function(){
        window.frame.maximize();
      }
    },{
      label:''//separator
    },{
      label:'Restore',
      action:function(){
        window.frame.restore();
      }
    }
  ]
}]);

menubar.on('select',function(item){
  console.log("menu item "+item.label+" clicked");
});

var trayMenu = app.createMenu([{
  label:'Show',
  action:function(){
    window.frame.show();
  },
},{
  label:'Minimize',
  action:function(){
    window.frame.hide();
  }
},{
  label:'Exit',
  action:function(){
    window.close();
  }
}]);

var statusIcon = app.createStatusIcon({
  icon:'./data/content/icons/32.png',
  tooltip:'AppJS Hello World',
  menu:trayMenu
});

var window = app.createWindow({
  width  : 660,
  height : 460,
  icons  : __dirname + '/content/icons'
});



window.on('create', function(){
  console.log("Window Created");
  window.frame.show();
  window.frame.center();
  window.frame.setMenuBar(menubar);
});

window.on('ready', function(){
  console.log("Window Ready");
  window.process = process;
  window.module = module;

  function F12(e){ return e.keyIdentifier === 'F12' }
  function Command_Option_J(e){ return e.keyCode === 74 && e.metaKey && e.altKey }

  window.addEventListener('keydown', function(e){
    if (F12(e) || Command_Option_J(e)) {
      window.frame.openDevTools();
    }
  });

  window.addEventListener('img-compress', function(e){
    fileSelector(krakenizeMe,{'Images':['*.jpg','*.png']});
  });
  
  window.addEventListener('css-compress', function(e){
    fileSelector(cssCleanMe,{'Cascading Style Sheet':['*.css']});
  });

  window.addEventListener('js-compress', function(e){
    fileSelector(uglifyMe,{'Javascript':['*.js']});
  });
});

window.on('close', function(){
  console.log("Window Closed");
});

function fileSelector(func, types) {
  window.frame.openDialog({
    type: 'open', 
    title: 'Selectionnez les fichiers à compresser...', 
    multiSelect: true, 
    dirSelect:false,
    acceptTypes: types           
    }, function( err , files ) {
      func(files);
   });
}

function krakenizeMe (files){
  var kraken = new Kraken({
    'user': 'rittmeyer',
    'pass': 'secreta11',
    'apikey': 'ac885df1a2ebdb462be65bad56ec0104'
  });
  for(var i=0; i<files.length; i++) {
    window.console.log("processing " + files[i]);
    kraken.upload(files[i], function(status) {
      window.console.log(status);
      if (status.success) {
        var name = status.krakedURL;
        name = name.substring(name.lastIndexOf('/')+1);
        request(status.krakedURL).pipe(fs.createWriteStream(name));
      } else {
        returnError(status.error);
        return;
      }
    });
  }
  returnSuccess("Images compressed");
}

function uglifyMe (files) {
  var result = UglifyJS.minify(files);
  fs.writeFile('min.js', result.code, "utf-8", function(err) {
    if (err) { 
      returnError(err);
      return;
    } else {
      returnSuccess("Javascript uglifyed");
    }
  });
}

var cssmin;
function cssCleanMe (files) {
  cssmin = "";
  for(var i=0; i<files.length; i++) {
    var data = fs.readFileSync(files[i], "utf-8");
    cssmin += cleanCSS.process(data, {removeEmpty:true});
  }
  fs.writeFile('min.css', cssmin, function (err) {
    if (err) { 
      returnError(err);
      return;
    } else {
      returnSuccess("CSS compressed");
    }
    cssmin = "";
  });
}

function returnError(msg){
  var error = window.document.createEvent("CustomEvent");
  error.initCustomEvent("error-evt", true, true, {extra:msg});
  window.dispatchEvent(error);
}

function returnSuccess(msg){
  var success = window.document.createEvent("CustomEvent");
  success.initCustomEvent("success-evt", true, true, {extra:msg});
  window.dispatchEvent(success);
}