!function r(s,a,u){function l(e,t){if(!a[e]){if(!s[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(c)return c(e,!0);var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}var i=a[e]={exports:{}};s[e][0].call(i.exports,function(t){return l(s[e][1][t]||t)},i,i.exports,r,s,a,u)}return a[e].exports}for(var c="function"==typeof require&&require,t=0;t<u.length;t++)l(u[t]);return l}({1:[function(t,e,n){"use strict";n.__esModule=!0,n.environment={env:"production",postUrl:"https://heatmaps.monsido.com",getUrl:"https://heatmaps.monsido.com/v1/settings/{token}.json",maxDataLength:500,compression:16,log:!1,apiData:{}}},{}],2:[function(t,e,n){"use strict";function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t,e){return null!=e&&"undefined"!=typeof Symbol&&e[Symbol.hasInstance]?e[Symbol.hasInstance](t):t instanceof e}n.__esModule=!0;var i=t("./environments/environment"),s=t("./utilities"),a=(u.prototype.getSessionId=function(){var n=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=(n+16*Math.random())%16|0;return n=Math.floor(n/16),("x"==t?e:3&e|8).toString(16)})},u.prototype.record=function(){var n=this;if("development"===i.environment.env||null===i.environment.getUrl)this.init(i.environment.apiData),this.startRecording(i.environment.apiData);else{var o=new XMLHttpRequest;o.open("GET",i.environment.getUrl.replace("{token}",this.token),!0),o.withCredentials=!1,o.onload=function(t){if(4!==o.readyState||200!==o.status)throw Error("Heatmap Settings not available");var e=JSON.parse(o.responseText);n.init(e),n.startRecording(e)},o.send(null)}},u.prototype.startRecording=function(t){var e=this;if(this.shouldRun){var n=this.getPageRule(t);n&&0<n.map_type.length&&(this.getScrollTop()&&this.frames.push(["s",this.getScrollLeft(),this.getScrollTop()]),-1<n.map_type.indexOf("movement")&&(window.onmousemove=this.moveListener(function(t){e.setFrame(t)})),-1<n.map_type.indexOf("click")&&(window.onmousedown=this.clickListener(function(t){e.setFrame(t)})),-1<n.map_type.indexOf("scroll")&&window.addEventListener("scroll",function(t){e.scrollListener(function(t){e.setFrame(t)})}))}},u.prototype.init=function(t){0<t.rules.length&&(this.shouldRun=1===s.Utilities.getRandomFromNumberFromPercentage(t.traffic_percentage,1))},u.prototype.exit=function(){this.saveData(!0)},u.prototype.setFrame=function(t){this.frames.push(t),this.saveData()},u.prototype.getTime=function(){return Math.abs(Date.now()-this.startTime)},u.prototype.saveData=function(t){var e=this.generateDataObject();(e.data.length>=this.maxDataLength||!0===t&&1<=e.data.length)&&(this.log&&console.log(e),this.isSendBeaconSupported()?navigator.sendBeacon(this.postUrl,JSON.stringify(e)):this.sendBeacon(this.postUrl,JSON.stringify(e)),this.frames=[])},u.prototype.moveListener=function(e){var n=this;return function(t){e&&e(["m",Math.round(t.clientX),Math.round(Math.floor(n.getScrollTop())+t.clientY),window.innerWidth,window.innerHeight,n.getTime()])}},u.prototype.clickListener=function(n){var o=this;return function(t){if(n){var e=void 0;t.path[0]&&(e=o.getCssSelector(t.path[0])),n(["c",Math.round(t.clientX),Math.round(Math.floor(o.getScrollTop())+t.clientY),window.innerWidth,window.innerHeight,o.getTime(),e])}}},u.prototype.scrollListener=function(t){"function"==typeof t&&s.Utilities.isNumber(this.getScrollLeft())&&s.Utilities.isNumber(this.getScrollTop())&&window.innerWidth&&window.innerHeight&&t(["s",Math.round(this.getScrollLeft()),Math.round(this.getScrollTop()),window.innerWidth,window.innerHeight,this.getTime()])},u.prototype.compressDataSet=function(t){for(var e=[],n=0;n<t.length;n++)if(0===e.length||"c"===t[n][0]||"s"===t[n][0])e.push(t[n]);else if("m"===t[n][0]){var o=e.filter(function(t){return"m"===t[0]});0===o.length?e.push(t[n]):(this.distanceBetween(t[n][1],o[o.length-1][1])>this.compression||this.distanceBetween(t[n][2],o[o.length-1][2])>this.compression)&&e.push(t[n])}return e},u.prototype.getScrollTop=function(){return window.scrollY||document.documentElement.scrollTop},u.prototype.getScrollLeft=function(){return window.scrollX||document.documentElement.scrollLeft},u.prototype.distanceBetween=function(t,e){return e<t?t%e:e%t},u.prototype.generateDataObject=function(){var t=(new Date).toISOString(),e=this.compressDataSet(this.frames);return{token:this.token,data:e,session_ts:this.startTimeISO,session_id:this.sessionId,timestamp:t,url:s.Utilities.getPageUrl()}},u.prototype.sendBeacon=function(t,e){var n=window.event&&window.event.type,o="unload"===n||"beforeunload"===n,i=new XMLHttpRequest;i.open("POST",t,!o),i.withCredentials=!1,i.setRequestHeader("Accept","*/*"),i.setRequestHeader("Content-Type","application/json");try{i.send(e)}catch(t){return!1}return!0},u.prototype.isSendBeaconSupported=function(){return"navigator"in window&&"sendBeacon"in window.navigator},u.prototype.getPageRule=function(t){for(var e=s.Utilities.getPageUrl(),n=0;n<t.rules.length;n++)if(t.rules[n].url.replace(/\/$/,"")===e.replace(/\/$/,""))return t.rules[n]},u.prototype.getCssSelector=function(t){if(r(t,Element)){for(var e=[];t&&t.nodeType===Node.ELEMENT_NODE;){var n=t.nodeName.toLowerCase();if(t.id){n+="#"+t.id,e.unshift(n);break}for(var o=t,i=1;o=o.previousElementSibling;)o.nodeName.toLowerCase()==n&&i++;1!=i&&(n+=":nth-of-type("+i+")"),e.unshift(n),t=t.parentElement}return e.join(" > ")}},u.prototype.setupPathPolyfill=function(){"path"in Event.prototype||Object.defineProperty(Event.prototype,"path",{get:function(){for(var t=[],e=this.target;e;)t.push(e),e=e.parentElement;return-1===t.indexOf(window)&&-1===t.indexOf(document)&&t.push(document),-1===t.indexOf(window)&&t.push(window),t}})},u);function u(t){var e=this;if(this.shouldRun=!1,this.startTimeISO=(new Date).toISOString(),this.startTime=Date.now(),this.sessionId=this.getSessionId(),this.maxDataLength=i.environment.maxDataLength,this.postUrl=i.environment.postUrl,this.compression=i.environment.compression,this.log=i.environment.log,this.isString=function(t){return"string"==typeof t},this.isBlob=function(t){return r(t,Blob)},this.frames=[],Array.isArray(t)&&0<t.length&&t[0][1])this.token=t[0][1];else{if(!t||"object"!==o(t)||!t.token)throw Error("Domain token is not defined");this.token=t.token}this.setupPathPolyfill(),window.onbeforeunload=function(){e.exit()},window.onunload=function(){e.exit()}}n.MonMouse=a},{"./environments/environment":1,"./utilities":5}],3:[function(t,e,n){},{}],4:[function(t,e,n){"use strict";n.__esModule=!0;var o=t("./mouse");window._monsido=window._monsido||{},new o.MonMouse(window._monsido).record()},{"./mouse":2}],5:[function(t,e,n){"use strict";n.__esModule=!0;var o=(i.getRandomFromNumberFromPercentage=function(t,e){void 0===t&&(t=10),void 0===e&&(e=10);for(var n=t,o=[],i=0;i<100;i++)0<n&&(99-i<=n||1===Math.round(Math.random()))?(n--,o.push(e)):(i===e&&n--,o.push(i));return o[Math.floor(100*Math.random())]},i.getPageUrl=function(){var t="";return"string"!=typeof location.origin&&(location.origin=location.protocol+"//"+location.host),location.hash&&this.isOldSPAUrl(location.hash)&&(t=location.hash),location.origin+location.pathname+t},i.log=function(t,e){var n=window.console;switch(n=n||{log:function(t){},warn:function(t){},error:function(t){}},e){case"info":n.log(t);break;case"warning":n.warn(t);break;case"error":n.error(t)}},i.isOldSPAUrl=function(t){return"/"===t.charAt(1)||"!"===t.charAt(1)},i.isNumber=function(t){return"number"==typeof t},i);function i(){}n.Utilities=o},{}]},{},[3,4]);