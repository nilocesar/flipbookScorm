///////////////////////////////////////////////////
//  CONTROLE SCORM JQUERY v0.0.1 --- 09/09/2014  //
///////////////////////////////////////////////////
///// TODO: O "SCORM CONTROLE" DEVE SER CHAMADA DEPOIS DO SCORM_WRAPPER 

(function($) {

    // Global Variables
    var BASE = this;

    $.fn.scorm_controle = function(options) 
    {
        var settings = $.extend(
        {
            SCO: "index",
            PAGE: "index.html",
            PAGE_CURRENT:1,
            PAGE_ALL: 1,
            PAGE_STATUS: [],
            lessonLocation: 1,
            lessonStatus: "incomplete",
            sessionTime: "",
            suspendData: "",
            inLMS: false,
            OBJ: undefined,
            StartDate: undefined,
            SCORM_API: undefined

        }, options);

        BASE.SCORM = settings;


        //////////////////////////////////
        //  INICIANDO a API DO SCORM    //
        //////////////////////////////////

        (function() {
            
            BASE.SCORM.inLMS = pipwerks.SCORM.init() ? true : false;
            
            if (BASE.SCORM.inLMS) 
            {
                var _lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location");
                if (_lessonLocation != null && _lessonLocation != undefined && _lessonLocation != "null" && _lessonLocation != "undefined" && _lessonLocation != "" ) 
                {
                    BASE.SCORM.lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location"); /// 256 caract// retorna que etapa ele esta no curso!
                } 
                else 
                {
                    BASE.SCORM.lessonLocation = "";
                }

                var _lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status"); // STATUS completo oou nãoT 
                if (_lessonStatus != null&& _lessonStatus != undefined && _lessonStatus != "null"&&_lessonStatus != "undefined" && _lessonStatus!="")                 {
                    BASE.SCORM.lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status");
                } else {
                    BASE.SCORM.lessonStatus = "";
                }

                var _suspendData = pipwerks.SCORM.get("cmi.suspend_data");
                if (_suspendData != null && _suspendData != undefined && _suspendData != "null" && _suspendData != "undefined" && _suspendData != "")                 {
                    BASE.SCORM.suspendData = pipwerks.SCORM.get("cmi.suspend_data"); ///4056 caracT //// retorna o suspendata do curso!
                } else {
                    BASE.SCORM.suspendData = "";
                }
            }

            /* 
            var i = 0;
            var o = {};
            var d = "";
            
            for (i = 0; i != BASE.SCORM.Structure.length; i++) {
                o = BASE.SCORM.Structure[i];
                d = BASE.getSuspendData("obj" + o.id) || "";
                if (d != "") {
                    o.setData(d);
                }
            }*/

        })();
    }

    /////////////////////////
    //   START DO CURSO    //
    /////////////////////////

    $.fn.scorm_start = function( _pageAll ) 
    {
        BASE.SCORM.PAGE_ALL = _pageAll;
        
        for ( var i = 1; i <= BASE.SCORM.PAGE_ALL; i++ )
        {
            var _obj = {};
            _obj.page = "pagina" + i;
            _obj.status = false;  
            BASE.SCORM.PAGE_STATUS.push( _obj );
        }
       
        if(BASE.SCORM.inLMS) 
        {
            BASE.debug("[start_timer called]");
            BASE.StartDate = new Date().getTime();
            BASE.verifyStatus();
        }
        
    }
    
    
    //////////////////////////////////////
    //     LESSON LOCATION  - public    //
    //////////////////////////////////////
    ///TODO: Retorna e envia qual é o local vc esta no Curso -- máx de 256 caract
    
    
    $.fn.scorm_get_lessonLocation = function( variable )
    {
        return BASE.Get_lessonLocation( variable );
    }

    $.fn.scorm_set_lessonLocation = function( variable, value )
    { 
        BASE.Set_lessonLocation( variable, value ) 
    }
    
    ///////////////////////////////
    //   SUSPEND DATA - public   //
    ///////////////////////////////

    $.fn.scorm_get_suspendData = function( variable )
    {
        return BASE.Get_suspendData( variable );
    }

    $.fn.scorm_set_suspendData = function(variable, value) 
    {
        BASE.Set_suspendData( variable, value )
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                        FUNCTIONS PRIVADAS                                         //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////
    //      LESSON LOCATION - Private        //
    ///////////////////////////////////////////
    
    BASE.Get_lessonLocation = function( variable )
    {
        var output = "";
        
        if ( BASE.SCORM.inLMS ) 
        {
            var lessonLocation = BASE.SCORM.lessonLocation;
            
            var startPosition = lessonLocation.indexOf(variable);
            if (startPosition > -1) {
                var endPosition = lessonLocation.indexOf(";", startPosition) == -1 ? lessonLocation.length : lessonLocation.indexOf(";", startPosition);
                var block = lessonLocation.substr(startPosition, (endPosition - startPosition));
                output = block.split("=")[1];
            }
        }
        else
        {
            output = "1";
        }
        
        return output;
    }

    BASE.Set_lessonLocation = function( variable, value )
    { 
        if ( BASE.SCORM.inLMS ) 
        {    
            var lessonLocation = BASE.SCORM.lessonLocation;
            var indexInit = lessonLocation.indexOf(variable);
            if (indexInit <= -1) 
            {
                lessonLocation += lessonLocation == "" ? (variable + "=" + value) : ";" + (variable + "=" + value);
            } 
            else 
            {
                var indexEnd = lessonLocation.indexOf(";", indexInit) <= -1 ? lessonLocation.length : lessonLocation.indexOf(";", indexInit);
                var block = lessonLocation.substr(indexInit, (indexEnd - indexInit));
                lessonLocation = lessonLocation.split(block).join((variable + "=" + value));
            }

            BASE.SCORM.lessonLocation = lessonLocation;
 
            pipwerks.SCORM.set( "cmi.core.lesson_location",  BASE.SCORM.lessonLocation );
            pipwerks.SCORM.save();
            
            ///Troca de página
            BASE.changePage( value );
            
        }
    }
    
    ///////////////////////////////////////////
    //         SUSPENDDATA - Private         //
    ///////////////////////////////////////////
    
     BASE.Get_suspendData = function( variable )
     {
        if (BASE.SCORM.inLMS) 
        {
            var output = "";
            var suspendData = BASE.SCORM.suspendData;
            var startPosition = suspendData.indexOf(variable);
            if (startPosition > -1) {
                var endPosition = suspendData.indexOf(";", startPosition) == -1 ? suspendData.length : suspendData.indexOf(";", startPosition);
                var block = suspendData.substr(startPosition, (endPosition - startPosition));
                output = block.split("=")[1];
            }

            return output;
        }
     }
     
     BASE.Set_suspendData = function( variable, value )
     {
        if ( BASE.SCORM.inLMS ) 
        {
            var suspendData = BASE.SCORM.suspendData;
            var indexInit = suspendData.indexOf(variable);
            
            if (indexInit <= -1)
            {
                suspendData += suspendData == "" ? (variable + "=" + value) : ";" + (variable + "=" + value);
            } 
            else 
            {
                var indexEnd = suspendData.indexOf(";", indexInit) <= -1 ? suspendData.length : suspendData.indexOf(";", indexInit);
                var block = suspendData.substr(indexInit, (indexEnd - indexInit));
                suspendData = suspendData.split(block).join((variable + "=" + value));
            }
            BASE.SCORM.suspendData = suspendData;
        
           pipwerks.SCORM.set("cmi.suspend_data", BASE.SCORM.suspendData);
           pipwerks.SCORM.save();
        }
     }

    ///////////////////////////////////////////
    // CONTROLA O TEMPO PARA O LMS DO SCORM  //
    ///////////////////////////////////////////

    BASE.ComputeTime = function() 
    {
        if ( BASE.SCORM.StartDate != 0 ) 
        {
            var currentDate = new Date().getTime();
            var elapsedSeconds = ((currentDate - BASE.SCORM.StartDate) / 1000);
            var formattedTime = BASE.ConvertTotalSeconds(elapsedSeconds);
        } 
        else 
        {
            formattedTime = "00:00:00.0";
        }

        BASE.SCORM.sessionTime = formattedTime;
        pipwerks.SCORM.set("cmi.core.session_time", formattedTime);
        BASE.debug("[compute_time called]");
    }


    ////////////////////////////////////////////
    //     ConvertTotalSeconds { SCORM }      //
    ////////////////////////////////////////////

    BASE.ConvertTotalSeconds = function(ts) {
        var sec = (ts % 60);

        ts -= sec;
        var tmp = (ts % 3600); //# of seconds in the total # of minutes
        ts -= tmp; //# of seconds in the total # of hours

        // convert seconds to conform to CMITimespan type (e.g. SS.00)
        sec = Math.round(sec * 100) / 100;

        var strSec = new String(sec);
        var strWholeSec = strSec;
        var strFractionSec = "";

        if (strSec.indexOf(".") != -1) {
            strWholeSec = strSec.substring(0, strSec.indexOf("."));
            strFractionSec = strSec.substring(strSec.indexOf(".") + 1, strSec.length);
        }

        if (strWholeSec.length < 2) {
            strWholeSec = "0" + strWholeSec;
        }
        strSec = strWholeSec;

        if (strFractionSec.length) {
            strSec = strSec + "." + strFractionSec;
        }

        if ((ts % 3600) != 0)
            var hour = 0;
        else var hour = (ts / 3600);
        if ((tmp % 60) != 0)
            var min = 0;
        else var min = (tmp / 60);

        if ((new String(hour)).length < 2)
            hour = "0" + hour;
        if ((new String(min)).length < 2)
            min = "0" + min;

        var rtnVal = hour + ":" + min + ":" + strSec;

        return rtnVal;
    }


    //////////////////
    // CHANGE PAGE  //
    //////////////////

    BASE.changePage = function( _pageCurrent )
    {
        BASE.Set_suspendData( "pagina"+ _pageCurrent + "_status" , "true" )
        
        BASE.SCORM.PAGE_CURRENT = _pageCurrent;
        BASE.debug("troca de página " +  BASE.SCORM.PAGE_CURRENT ); 

        BASE.verifyStatus();
        BASE.ComputeTime();
    }



    ///////////////////
    // VERIFY STATUS //
    ///////////////////
    
    BASE.verifyStatus = function() 
    {
        ///////////////////////////////
        // EVITA PROBLEMAS COM O LMS //
        ///////////////////////////////
        //BASE.SCORM.suspendData = "||";
        //pipwerks.SCORM.set( "cmi.suspend_data" , BASE.SCORM.suspendData );
        //pipwerks.SCORM.save();
        ////////////////////////////////
        
        
        ///Mexer Aq -- só falta isso
        ///Controle de Complete
        if( BASE.SCORM.lessonStatus == "incomplete" ) 
        {
            BASE.SCORM.lessonStatus = "completed";
            
            for ( var i = 1; i <= BASE.SCORM.PAGE_ALL; i++ )
            {
                var _pageStatus = "pagina"+ i + "_status";

                if( ( BASE.Get_suspendData( _pageStatus ) ) != "true" )
                {
                    BASE.SCORM.lessonStatus = "incomplete";
                }
            }

            if( BASE.SCORM.lessonStatus == "completed" ) 
            {
                if (BASE.SCORM.inLMS) 
                {
                    BASE.debug("COMPLETE LMS") 
                    pipwerks.SCORM.set( "cmi.core.lesson_status", "completed" );
                    pipwerks.SCORM.save();
                }
            } 
        }
    }

    ////////////////////
    //     DEBUG      //
    ////////////////////

    BASE.debug = function(msg, type) 
    {
        if( window.console && console.debug && this.debugMode ) 
        {
            console.debug(msg);
        };
    }


}(jQuery));