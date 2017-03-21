// $(document).ready(function () {
$('#myCanvas').css('background-image', 'url(/b.jpg)');
var soc_canvas2 = io.connect('/soc_canvas2');
var color_json = {};
var path;
var _rgbPicker = { // default color when refresh page
    red: 47,
    green: 47,
    blue: 47
};
tool.minDistance = 10;
tool.maxDistance = 45;
updateCanvasColor();
$('#getColor').colorpicker().on('changeColor', function (event) {
    _rgbPicker.red = event.color.toRGB().r;
    _rgbPicker.green = event.color.toRGB().g;
    _rgbPicker.blue = event.color.toRGB().b;
    updateCanvasColor();
});
$('#opacity').on('change', function() {
    updateCanvasColor();
});
function updateCanvasColor() {
    var red = _rgbPicker.red / 255;
    var green = _rgbPicker.green / 255;
    var blue = _rgbPicker.blue / 255;
    var opacity =  $('#opacity').val() / 255;
    console.log('opacity: ' + $('#opacity').val()+', red: '+red+', green: '+green+', blue: '+blue);
    color_json = {
        red : red,
        green : green,
        blue : blue,
        opacity : opacity
    };
}
/*----------------------------------event_mouse_handler_start*/
/*------------------------------------------------onMouseDown*/
function onMouseDown(event) {
    _mouseDown(event.point);
    _emitMouseDown(event.point);
}
function _mouseDown (point) {
    path = new Path();
    path.add(point);
}
function _emitMouseDown (point) {
    var data = {
        point: point
    }
    soc_canvas2.emit('mouseDown', data);
}
soc_canvas2.on('mouseDownOthers', function (data) {
    console.log('mouseDownOthers: ', data);
    _mouseDown(data.point);
});
/*------------------------------------------------onMouseDrag*/
function onMouseDrag(event) {
    var step = event.delta / 5;
    step.angle += 30;
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;
    _drawLine(top, bottom, color_json);
    _emitLine(top, bottom, color_json);
}
function _drawLine (top, bottom, cJson) {
    path.fillColor = new RgbColor( cJson.red, cJson.green, cJson.blue, cJson.opacity );
    path.add(top);
    path.insert(0, bottom);
    path.smooth();
    view.draw();
}
function _emitLine (top, bottom, cJson) {
    var data = {
        top : top,
        bottom : bottom,
        cJson : cJson
    };
    soc_canvas2.emit('drawLine', data);
}
soc_canvas2.on('drawLineOthers', function (data) {
    console.log('drawLineOthers: ', data);
   _drawLine(data.top, data.bottom, data.cJson);
});
/*--------------------------------------------------onMouseUp*/
function onMouseUp(event) {
    _mouseUp(event.point);
    _emitMouseUp(event.point);
}
function _mouseUp (point) {
    path.add(point);
    path.closed = true;
    path.smooth();
    view.draw();
}
function _emitMouseUp (point) {
    var data = {
        point: point
    };
    soc_canvas2.emit('mouseUp', data);
}
soc_canvas2.on('mouseUpOthers', function (data) {
    console.log('mouseUpOthers: ', data);
   _mouseUp(data.point);
});
/*---------------------------------event_mouse_handler_end*/
// });