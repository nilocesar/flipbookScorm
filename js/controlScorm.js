
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ....... SCORM  .............. //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Scorm = (function () {
    Scorm.prototype.OBJ = undefined;
    Scorm.prototype.SCO = "index";
    Scorm.prototype.PAGE = "index.html";
    Scorm.prototype.CourseName = "";
    Scorm.prototype.Structure = [];
    Scorm.prototype.StructureContent = "";

    Scorm.prototype.StartDate = undefined;
    Scorm.prototype.inLMS = false;
    Scorm.prototype.SCORM_API = undefined;

    Scorm.prototype.SCORM = {
        lessonLocation: 1,
        lessonStatus: "incomplete",
        sessionTime: "",
        suspendData: ""
    }
    ///////////////////////////////////////
    // Constructor
    ///////////////////////////////////////
    function Scorm() {
        this.CourseName = CourseName;
        this.Structure = Structure;

        CourseName = "";
        Structure = undefined;

        this.init();
    }

    ///////////////////////////////////////
    // INIT
    ///////////////////////////////////////
    Scorm.prototype.init = function () {
        
        alert("aaddd")
        var $THIS = this;

        this.inLMS = pipwerks.SCORM.init() ? true : false;

        if (this.inLMS) {
            var _lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location");
            if (_lessonLocation != null && _lessonLocation != undefined && _lessonLocation != "null" && _lessonLocation != "undefined" && _lessonLocation != "" && _lessonStatus.length >= 1) {
                this.SCORM.lessonLocation = pipwerks.SCORM.get("cmi.core.lesson_location");
            } else {
                this.SCORM.lessonLocation = "";
            }

            var _lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status");
            if (_lessonStatus != null && _lessonStatus != undefined && _lessonStatus != "null" && _lessonStatus != "undefined" && _lessonStatus != "" && _lessonStatus.length >= 1) {
                this.SCORM.lessonStatus = pipwerks.SCORM.get("cmi.core.lesson_status");
            } else {
                this.SCORM.lessonStatus = "";
            }

            var _suspendData = pipwerks.SCORM.get("cmi.suspend_data");
            if (_suspendData != null && _suspendData != undefined && _suspendData != "null" && _suspendData != "undefined" && _suspendData != "" && _suspendData.length >= 1) {
                this.SCORM.suspendData = pipwerks.SCORM.get("cmi.suspend_data");
            } else {
                this.SCORM.suspendData = "";
            }
        }

        var i = 0;
        var o = {};
        var d = "";
        for (i = 0; i != this.Structure.length; i++) {
            o = this.Structure[i];
            d = this.getSuspendData("obj" + o.id) || "";
            if (d != "") {
                o.setData(d);
            }
        }

        $.get("config/ementa.html", function (data) {
            $THIS.StartTimer();
            $THIS.StructureContent = data;
            $THIS.changePage("menu");
        });
    }

    ///////////////////////////////////////
    // Start Timer { SCORM }
    ///////////////////////////////////////
    Scorm.prototype.StartTimer = function () {
        this.debug("[start_timer called]");
        this.StartDate = new Date().getTime();
    };

    ///////////////////////////////////////
    // Compute session time and set to lms { SCORM }
    ///////////////////////////////////////
    Scorm.prototype.ComputeTime = function () {
        if (this.StartDate != 0) {
            var currentDate = new Date().getTime();
            var elapsedSeconds = ((currentDate - this.StartDate) / 1000);
            var formattedTime = this.ConvertTotalSeconds(elapsedSeconds);
        } else {
            formattedTime = "00:00:00.0";
        }

        this.SCORM.sessionTime = formattedTime;
        if (this.inLMS) {
            pipwerks.SCORM.set("cmi.core.session_time", formattedTime);
        }

        this.debug("[compute_time called]");
    }

    ///////////////////////////////////////
    // ConvertTotalSeconds { SCORM }
    ///////////////////////////////////////
    Scorm.prototype.ConvertTotalSeconds = function (ts) {
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

    ///////////////////////////////////////
    // GET SUSPEND DATA
    ///////////////////////////////////////
    Scorm.prototype.getSuspendData = function (variable) {
        var output = "";
        var suspendData = this.SCORM.suspendData;
        var startPosition = suspendData.indexOf(variable);
        if (startPosition > -1) {
            var endPosition = suspendData.indexOf(";", startPosition) == -1 ? suspendData.length : suspendData.indexOf(";", startPosition);
            var block = suspendData.substr(startPosition, (endPosition - startPosition));
            output = block.split("=")[1];
        }
        return output;
    }

    Scorm.prototype.setSuspendData = function (variable, value) {
        var suspendData = this.SCORM.suspendData;
        var indexInit = suspendData.indexOf(variable);
        if (indexInit <= -1) {
            suspendData += suspendData == "" ? (variable + "=" + value) : ";" + (variable + "=" + value);
        } else {
            var indexEnd = suspendData.indexOf(";", indexInit) <= -1 ? suspendData.length : suspendData.indexOf(";", indexInit);
            var block = suspendData.substr(indexInit, (indexEnd - indexInit));
            suspendData = suspendData.split(block).join((variable + "=" + value));
        }
        this.SCORM.suspendData = suspendData;
        if (this.inLMS) {
            pipwerks.SCORM.set("cmi.suspend_data", this.SCORM.suspendData);
            pipwerks.SCORM.save();
        }
    }


    ///////////////////////////////////////
    // CHANGE PAGE
    ///////////////////////////////////////
    Scorm.prototype.changePage = function (sco) {

        var $THIS = this;
        if (this.OBJ) {
            $(this.OBJ).off("complete");
        }

        var page = "";
        switch (sco) {
        case "menu":
            this.OBJ = null;
            this.SCO = "MENU";
            page = "menu.html";
            break;
        default:
            var obj = this.getObjById(sco);
            if (obj != null && obj != undefined) {
                this.OBJ = obj;
                this.SCO = obj.id;
                page = this.getPageByType(obj);
            }
            break;
        }


        if (page != "") {
            this.PAGE = page;
            $(this.OBJ).on("complete", function () {
                $THIS.verifyStatus();
            });
            $("#icontent").transition({
                opacity: 0
            }, 500, function () {
                window.frames["icontent"].location.replace("about:blank");
                $.get(page, function (data) {
                    window.frames["icontent"].document.write(data);
                });
            });

            $THIS.verifyStatus();
            this.ComputeTime();
        }
    }

    ///////////////////////////////////////
    // INIT PAGE
    ///////////////////////////////////////
    Scorm.prototype.initPage = function (scope) {
        scope.init();
    }

    ///////////////////////////////////////
    // INIT LOADED
    ///////////////////////////////////////
    Scorm.prototype.initLoaded = function () {
        $("#icontent").transition({
            opacity: 100
        });
    }

    ///////////////////////////////////////
    // VERIFY STATUS
    ///////////////////////////////////////
    Scorm.prototype.verifyStatus = function () {
        var i = 0;
        var percent = 0;
        var completeds = 0;
        var suspendDataTMP = "";
        for (i = 0; i != this.Structure.length; i++) {
            if (this.Structure[i].completed) {
                completeds++;
            }
            suspendDataTMP += "obj" + this.Structure[i].id + "=" + this.Structure[i].getData() + ";";
        }
        suspendDataTMP = suspendDataTMP.substr(0, suspendDataTMP.length - 1);
        percent = Math.floor((completeds * 100) / this.Structure.length);

        ////////////////////////////////////////////////////////////////////////////////////////
        // EVITA PROBLEMAS COM O LMS
        ////////////////////////////////////////////////////////////////////////////////////////
        this.SCORM.suspendData = suspendDataTMP;
        if (this.inLMS) {
            pipwerks.SCORM.set("cmi.suspend_data", this.SCORM.suspendData);
            pipwerks.SCORM.save();
        }
        ////////////////////////////////////////////////////////////////////////////////////////

        if (percent >= 100) {
            if (this.SCORM.lessonStatus != "completed") {
                this.SCORM.lessonStatus = "completed";
                if (this.inLMS) {
                    pipwerks.SCORM.set("cmi.core.lesson_status", "completed");
                    pipwerks.SCORM.save();
                }
            }
        }
    }

    ///////////////////////////////////////
    // GET NEXT SCO
    ///////////////////////////////////////
    Scorm.prototype.getNextSCO = function (obj) {
        var i = 0;
        var passed = false;
        var currentObj;
        for (i = 0; i != this.Structure.length; i++) {
            currentObj = this.Structure[i];
            if (currentObj == obj) {
                passed = true;
            } else {
                if (passed) {
                    return currentObj;
                }
            }
        }
        return null;
    }

    ///////////////////////////////////////
    // GET OBJ BY ID
    ///////////////////////////////////////
    Scorm.prototype.getObjById = function (id) {
        var i = 0;
        var currentObj;
        for (i = 0; i != this.Structure.length; i++) {
            currentObj = this.Structure[i];
            if (currentObj.id == id) {
                return currentObj;
            }
        }
        return null;
    }

    ///////////////////////////////////////
    // GET PAGE BY TYPE
    ///////////////////////////////////////
    Scorm.prototype.getPageByType = function (obj) {
        var page = "";
        var objType = obj.constructor.toString().match(/function (.{1,})\(/)[1];
        switch (objType) {
        case "Handout":
        case "Infographic":
            page = this.useIE() ? "book_ie.html" : "book.html";
            break;
        case "Evaluation":
            page = "question.html";
            break;
        case "Video":
            page = this.useIE() ? "video_ie.html" : "video.html";
            break;
        }
        return page;
    }

    ///////////////////////////////////////
    // USE IE
    ///////////////////////////////////////
    Scorm.prototype.useIE = function () {
        if (ie != undefined) {
            if (ie <= 9) {
                return true;
            }
        }
        return false;
    }

    ///////////////////////////////////////
    // GET HASH VARIABLES
    ///////////////////////////////////////
    Scorm.prototype.getHashVariables = function (w) {
        var obj = {};
        var query;
        if (w == undefined || w == null) {
            query = location.hash;
        } else {
            query = w.location.hash;
        }
        if (query) {
            query = query.substr(1, query.length - 1);
            var fields = query.split('&');
            for (var f = 0; f < fields.length; f++) {
                var field = fields[f].split('=');
                obj[unescape(field[0].replace(/\+/g, ' '))] = eval(unescape(field[1].replace(/\+/g, ' ')));
            }
        }
        return obj;
    }

    ///////////////////////////////////////
    // DEBUG
    ///////////////////////////////////////
    Scorm.prototype.debug = function (msg, type) {
        if (window.console && console.debug && this.debugMode) {
            console.debug(msg);
        };
    }

    return Scorm;

});