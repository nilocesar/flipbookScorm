//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// .......VAR  ...... /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var scormObj;
var level0 = this;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ....... CALL FLIPPAGE - onLoad.js ...... ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __configPath = 'config.json';
$('#fb5-ajax').data('config', 
{
    "config": __configPath
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ............  CONTROLE ...... //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$.get("index.html", function (data) 
{
    $('body').bind( 'pageInicialScorm', pageInicialScorm ); /// O Trigger(Dispach) desse Evento esta - onLoad.js
    $('#fb5-book').scorm_controle();
});


function pageInicialScorm() {
    
    //Star no Curso - passando o número total de páginas 
    var _pageTotal = $("#fb5-book").turn("pages");
    $('#fb5-book').scorm_start( _pageTotal );
   

    //Avisa qual página parou no LMS
    var _pageInicial = parseInt( $('#fb5-book').scorm_get_lessonLocation( "pagina" ) );
    $('#fb5-book').turn('page',  _pageInicial );
    

    $("#fb5-book").bind("turning", function( event, page, view ) 
    {
        //Esse view passa as 2 telas que esta sendo vista!
        var _viewArray = view;
        
        for(var i = 0; i < _viewArray.length; i++ )
        { 
            ///TODO: /// filtra quando aparecer uma tela 0... Ex.: Primeira e Ultima página
            if( _viewArray[i] != 0 )
            {
               $('#fb5-book').scorm_set_lessonLocation( "pagina" , _viewArray[i] );
            }
            
        }   
    });
    
    //Avisa que vc já passou pela pagina1 
    //FUTURE: Tentar melhorar isso!!
    $('#fb5-book').scorm_set_lessonLocation( "pagina" , 1 );

    
    
    /*$("#fb5-book").bind("last", function(event) 
    {
        //alert("last");s
    });

     $("#fb5-book").bind("first", function(event)
    {
        //alert("first");
    });*/
}