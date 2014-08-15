/**
 * Aristochart.js
 *
 * http://dunxrion.github.com/aristochart
 * 
 * @version 0.2
 * @author Adrian Cooney <cooney.adrian@gmail.com> (http://adriancooney.ie)
 * @license http://opensource.org/licenses/MIT
 *//** 
 * Aristochart's constructor.
 *
 * @param {Object} element The DOM element container or canvas to use
 * @param {Object} options See Options.
 * @param {Object} theme A theme object. See Aristochart.themes.
 */var Aristochart=function(e,t,n){if(!e||!e.DOCUMENT_NODE)t=e,e=document.createElement("canvas");if(!t||!t.data)throw new Error("Please provide some data to plot.");if(!t.data.y||!t.data.x)throw new Error("Please provide some data.x and data.y");t.width&&!t.height&&(t.height=Math.floor(t.width*.67));this.defaults=Aristochart.themes.default;this.options=t;this.canvas=e;this.theme=n;this.data=this.options.data;this.theme&&(this.defaults=Aristochart._deepMerge(this.defaults,this.theme));for(var r in this.defaults)this.options=Aristochart._deepMerge(this.defaults,this.options);for(var i in this.options.style)for(var r in this.options.style["default"])this.options.style[i]=Aristochart._deepMerge(this.options.style["default"],this.options.style[i]);this.indexes=[],that=this;["fill","axis","tick","line","point","label","title"].forEach(function(e){if(that.indexes[that.options[e].index])throw new Error("Conflicting indexes in Aristochart");that.indexes[that.options[e].index]=e});this.indexes=this.indexes.filter(function(e){if(e)return!0});if(this.canvas.getContext)this.ctx=this.canvas.getContext("2d");else{var s=document.createElement("canvas");this.canvas.appendChild(s);this.canvas=s;this.ctx=s.getContext("2d")}this.canvas.height=this.options.height;this.canvas.width=this.options.width;if(window.devicePixelRatio>1){this.canvas.style.height=this.canvas.height+"px";this.canvas.style.width=this.canvas.width+"px";this.canvas.height=this.canvas.height*window.devicePixelRatio;this.canvas.width=this.canvas.width*window.devicePixelRatio}this.resolution=window.devicePixelRatio||1;this.update();this.options.render&&this.render()};Aristochart._deepMerge=function(e,t){return function n(e,t){for(var r in e)t[r]==undefined?t[r]=e[r]:e[r]instanceof Object&&(t[r]=n(e[r],t[r]));return t}(e,t)};Aristochart.prototype.refreshBounds=function(){var e=-Infinity,t=Infinity;for(var n in this.data)if(n!=="x"){var r=-Infinity,i=Infinity;this.data[n].forEach(function(e){e>r&&(r=e);e<i&&(i=e)});e=r>e?r:e;t=i<t?i:t}this.y={max:this.options.axis.y.max==undefined?e:this.options.axis.y.max,min:this.options.axis.y.min==undefined?t:this.options.axis.y.min};this.y.range=this.y.max-this.y.min;this.data.x.length==1||typeof this.data.x=="number"?this.x={min:0,max:this.data.x[0]||this.data.x}:this.x={min:this.data.x[0],max:this.data.x[this.data.x.length-1]};this.x.range=this.x.max-this.x.min};Aristochart.prototype.update=function(){var e=this.resolution;this.options.margin*=e;this.options.padding*=e;this.options.width*=e;this.options.height*=e;this.box={x:this.options.margin,y:this.options.margin,x1:this.options.width-2*this.options.margin,y1:this.options.height-2*this.options.margin};this.refreshBounds();var t=this.getPoints();this.lines=t.lines;this.origin=t.origin;var n=this.options.padding,r=this.box;this.axis={x:{x:r.x-n,y:r.y+r.y1+n,x1:that.box.x+r.x1+n,y1:r.y+r.y1+n},y:{x:r.x-n,y:r.y-n,x1:r.x-n,y1:r.y+r.y1+n}}};Aristochart.prototype.render=function(){var e=this,t=this.lines,n=this.origin,r=this.axis,i=e.options.style.default;this.canvas.width=this.canvas.width;var s=Math.floor(this.options.axis.x.steps),o=Math.floor(this.options.axis.y.steps),u=this.options.padding,a=this.box,f=n.x,l=n.y;this.indexes.forEach(function(n){switch(n){case"point":for(var u in t)(e.options.style[u]||i).point.visible&&t[u].forEach(function(t){e.options.point.render.call(e,e.options.style[u]||i,t.rx,t.ry,t.x,t.y,t.graph)});break;case"axis":if(i.axis.visible){i.axis.x.visible&&e.options.axis.x.render.call(e,i,r.x.x,i.axis.y.fixed?r.x.y:l,r.x.x1,i.axis.y.fixed?r.x.y1:l,"x");i.axis.y.visible&&e.options.axis.y.render.call(e,i,i.axis.x.fixed?r.y.x:f,r.y.y,i.axis.x.fixed?r.y.x1:f,r.y.y1,"y")}break;case"line":for(var u in t){var a=e.options.style[u]||i;a.line.visible&&e.options.line.render.call(e,a,t[u])}break;case"tick":if(i.tick.visible){var c=e.box.x1/s,h=e.box.y1/o;for(var p=0;p<s+1;p++)e.options.tick.render.call(e,i,e.box.x+c*p,i.tick.x.fixed?r.x.y1:l,"x",p);for(var p=0;p<o+1;p++)e.options.tick.render.call(e,i,i.tick.y.fixed?r.y.x1:f,e.box.y+h*p,"y",p)}break;case"label":var c=e.box.x1/s,h=e.box.y1/o;if(i.label.x.visible)for(var p=0;p<s+1;p++)e.options.label.render.call(e,i,e.x.min+(e.x.max-e.x.min)/s*p,e.box.x+c*p,i.label.x.fixed?r.x.y1:l,"x",p);if(i.label.y.visible)for(var p=0;p<o+1;p++){var d=o-p,v=e.y.min+(e.y.max-e.y.min)/o*d;e.options.label.render.call(e,i,v,i.label.y.fixed?r.y.x1:f,e.box.y+h*p,"y",p)}break;case"fill":for(var u in t){var a=e.options.style[u]||i;a.line.fill&&e.options.fill.render.call(e,a,t[u])}break;case"title":if(i.title.visible){var m=e.options.title.x,g=e.options.title.y;i.title.x.visible&&e.options.title.render.call(e,i,m,(e.box.x*2+e.box.x1)/2,e.box.y+e.box.y1,"x");i.title.y.visible&&e.options.title.render.call(e,i,g,e.box.x,(e.box.y*2+e.box.y1)/2,"y")}}})};Aristochart.prototype.getPoints=function(e){var t={},n=this.x.max,r=this.x.min,i=this.x.range,s=this.y.max,o=this.y.min,u=this.y.range,a=this.box.x,f=this.box.y,l=this.box.x1,c=this.box.y1,h=f+c/u*s,p=a+l/i*Math.abs(r);for(var d in this.data){if(d=="x")continue;t[d]=[];var v=this.data[d],m=v.length,g=1;m>1e3&&(g=5);m>1e4&&(g=50);m>1e5&&(g=5e3);var y=m/g;for(var b=0;b<y;b++){var w=i/(y-1)*b+r,E=v[b],S=p+l/i*w,x=h-c/u*E;t[d].push({x:w,y:E,rx:S,ry:x});e&&e(S,x,w,E,d)}}return{lines:t,origin:{x:p,y:h}}};Aristochart.prototype.toImage=function(){var e=new Image;e.src=this.canvas.toDataURL("image/png");return e};Aristochart.point={circle:function(e,t,n,r,i,s){this.ctx.save();this.ctx.strokeStyle=e.point.stroke;this.ctx.lineWidth=e.point.width*this.resolution;this.ctx.fillStyle=e.point.fill;this.ctx.beginPath();this.ctx.arc(t,n,e.point.radius*this.resolution,0,Math.PI*2,!0);this.ctx.fill();this.ctx.stroke();this.ctx.restore()}};Aristochart.line={line:function(e,t){this.ctx.save();this.ctx.strokeStyle=e.line.stroke;this.ctx.lineWidth=e.line.width*this.resolution;this.ctx.beginPath();this.ctx.moveTo(t[0].rx,t[0].ry);var n=this;t.forEach(function(e){n.ctx.lineTo(e.rx,e.ry)});this.ctx.stroke();this.ctx.restore()},fill:function(e,t){this.ctx.save();this.ctx.fillStyle=e.line.fill;this.ctx.beginPath();this.ctx.moveTo(t[0].rx,t[0].ry);var n=this;t.forEach(function(e){n.ctx.lineTo(e.rx,e.ry)});this.ctx.lineTo(t[t.length-1].rx,this.box.y+this.box.y1+(e.line.fillToBaseLine?this.options.padding:0));this.ctx.lineTo(t[0].rx,this.box.y+this.box.y1+(e.line.fillToBaseLine?this.options.padding:0));this.ctx.closePath();this.ctx.fill();this.ctx.restore()}};Aristochart.tick={line:function(e,t,n,r,i){this.ctx.save();this.ctx.strokeStyle=e.tick.stroke;this.ctx.lineWidth=e.tick.width*this.resolution;this.ctx.beginPath();var s=i%2==0?e.tick.major:e.tick.minor;s*=this.resolution;var o=t,u=n;switch(e.tick.align){case"middle":r=="x"&&(u=n-s/2);r=="y"&&(o=t-s/2);break;case"inside":r=="x"&&(u=n-s);o=t;break;case"outside":r=="x"&&(u=n);r=="y"&&(o=t-s)}this.ctx.moveTo(o,u);r=="x"?this.ctx.lineTo(o,u+s):this.ctx.lineTo(o+s,u);this.ctx.stroke();this.ctx.restore()}};Aristochart.axis={line:function(e,t,n,r,i,s){this.ctx.save();this.ctx.strokeStyle=e.axis.stroke;this.ctx.lineWidth=e.axis.width*this.resolution;this.ctx.beginPath();this.ctx.moveTo(t,n);this.ctx.lineTo(r,i);this.ctx.stroke();this.ctx.restore()}};Aristochart.label={text:function(e,t,n,r,i,s){if(s%this.options.label[i].step==0){var o=e.label[i];i=="x"&&(r+=(e.tick.major+o.offsetY)*this.resolution);i=="y"&&(n-=(e.tick.major+o.offsetX)*this.resolution,r+=o.offsetY*this.resolution);this.ctx.font=o.fontStyle+" "+o.fontSize*this.resolution+"px "+o.font;this.ctx.fillStyle=o.color;this.ctx.textAlign=o.align;this.ctx.textBaseline=o.baseline;var u=/(\-?\d+(\.\d)?)/.exec(t)||[];this.ctx.fillText(u[0],n,r)}}};Aristochart.title={text:function(e,t,n,r,i){this.ctx.save();i=="x"&&(r+=e.title.x.offsetY,n+=e.title.x.offsetX);i=="y"&&(r+=e.title.y.offsetY,n+=e.title.y.offsetX);this.ctx.font=e.title.fontStyle+" "+e.title.fontSize*this.resolution+"px "+e.title.font;this.ctx.fillStyle=e.title.color;this.ctx.translate(n,r);i=="y"&&this.ctx.rotate(Math.PI/2);this.ctx.fillText(t,0,0);this.ctx.restore()}};window.jQuery&&(jQuery.fn.aristochart=function(e,t){if(!(this.length>1))return new Aristochart(this[0],e,t);this.each(function(n){new Aristochart(this[0],e,t)})});Aristochart.themes={};Aristochart.themes.default={width:640,height:400,margin:70,padding:20,render:!0,fill:{index:0,render:Aristochart.line.fill},axis:{index:1,render:Aristochart.axis.line,x:{steps:5,render:Aristochart.axis.line},y:{steps:10,render:Aristochart.axis.line}},tick:{index:2,render:Aristochart.tick.line},line:{index:3,render:Aristochart.line.line},point:{index:4,render:Aristochart.point.circle},label:{index:5,render:Aristochart.label.text,x:{step:1},y:{step:1}},title:{index:6,render:Aristochart.title.text,x:"x",y:"y"},style:{"default":{point:{stroke:"#000",fill:"#fff",radius:4,width:3,visible:!0},line:{stroke:"#298281",width:3,fill:"rgba(150, 215, 226, 0.4)",fillToBaseLine:!0,visible:!0},axis:{stroke:"#ddd",width:3,visible:!0,x:{visible:!0,fixed:!0},y:{visible:!0,fixed:!0}},tick:{align:"middle",stroke:"#ddd",width:2,minor:10,major:15,visible:!0,x:{fixed:!0},y:{fixed:!0}},label:{x:{font:"Helvetica",fontSize:14,fontStyle:"normal",color:"#000",align:"center",baseline:"bottom",offsetY:8,offsetX:3,visible:!0,fixed:!0},y:{font:"Helvetica",fontSize:10,fontStyle:"normal",color:"#000",align:"center",baseline:"bottom",offsetY:8,offsetX:8,visible:!0,fixed:!0}},title:{color:"#777",font:"georgia",fontSize:"16",fontStyle:"italic",visible:!0,x:{offsetX:0,offsetY:120,visible:!0},y:{offsetX:-135,offsetY:10,visible:!0}}}}};